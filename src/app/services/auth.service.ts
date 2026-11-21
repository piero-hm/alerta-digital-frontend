import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { createClient, Session } from '@supabase/supabase-js';
import { firstValueFrom } from 'rxjs';

import { environment } from '../environments/environment';
import {
  Perfil,
  RegistroResultado,
} from '../interfaces/auth.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly supabase = createClient(
    environment.supabaseUrl,
    environment.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );

  private inicializado = false;
  private cargandoPerfil: Promise<void> | null = null;

  readonly session = signal<Session | null>(null);
  readonly perfil = signal<Perfil | null>(null);

  readonly autenticado = computed(() => this.session() !== null);
  readonly accessToken = computed(() => this.session()?.access_token ?? null);
  readonly rol = computed(() => this.perfil()?.rol ?? null);
  readonly perfilCompleto = computed(() => this.perfil() !== null);
  readonly email = computed(() => this.session()?.user.email ?? null);

  async init(): Promise<void> {
    if (this.inicializado) {
      return;
    }

    this.inicializado = true;

    const { data } = await this.supabase.auth.getSession();
    this.session.set(data.session);

    this.supabase.auth.onAuthStateChange((evento, session) => {
      const sesionAnterior = this.session();
      this.session.set(session);

      if (!session) {
        this.perfil.set(null);
        return;
      }

      const cambioDeUsuario = sesionAnterior?.user.id !== session.user.id;

      if (cambioDeUsuario || (!this.perfil() && evento !== 'TOKEN_REFRESHED')) {
        void this.cargarPerfil();
      }
    });

    if (data.session) {
      await this.cargarPerfil();
    }
  }

  async login(email: string, password: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    this.session.set(data.session);
    await this.cargarPerfil();
  }

  async registrar(email: string, password: string): Promise<RegistroResultado> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    this.session.set(data.session);

    return { requiereConfirmacion: data.session === null };
  }

  async crearPerfil(dni: string, aceptoDatos: boolean): Promise<Perfil> {
    const perfil = await firstValueFrom(
      this.http.post<Perfil>(`${environment.apiUrl}/auth/perfil`, {
        dni,
        acepto_datos: aceptoDatos,
      }),
    );

    this.perfil.set(perfil);
    return perfil;
  }

  async cargarPerfil(): Promise<void> {
    if (this.cargandoPerfil) {
      return this.cargandoPerfil;
    }

    this.cargandoPerfil = this.cargarPerfilInterno().finally(() => {
      this.cargandoPerfil = null;
    });

    return this.cargandoPerfil;
  }

  private async cargarPerfilInterno(): Promise<void> {
    try {
      const perfil = await firstValueFrom(
        this.http.get<Perfil>(`${environment.apiUrl}/auth/me`),
      );

      this.perfil.set(perfil);
    } catch (error) {
      if (
        error instanceof HttpErrorResponse &&
        (error.status === 403 || error.status === 401)
      ) {
        this.perfil.set(null);
        return;
      }

      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.supabase.auth.signOut();
    } finally {
      this.session.set(null);
      this.perfil.set(null);
    }
  }
}
