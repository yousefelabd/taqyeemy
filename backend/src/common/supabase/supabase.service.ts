import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private anonClient: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL')!;
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY')!;
    const serviceKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!;

    this.anonClient = createClient(url, anonKey);
    this.adminClient = createClient(url, serviceKey);
  }

  // Used for public Auth operations (signup, login)
  getAnonClient(): SupabaseClient {
    return this.anonClient;
  }

  // Used ONLY for admin tasks that bypass RLS if strictly needed
  getAdminClient(): SupabaseClient {
    return this.adminClient;
  }

  // Creates an RLS-scoped Supabase client on behalf of the user using their Bearer JWT
  getUserClient(userJwt: string): SupabaseClient {
    const url = this.configService.get<string>('SUPABASE_URL')!;
    const anonKey = this.configService.get<string>('SUPABASE_ANON_KEY')!;

    return createClient(url, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${userJwt}`,
        },
      },
    });
  }
}
