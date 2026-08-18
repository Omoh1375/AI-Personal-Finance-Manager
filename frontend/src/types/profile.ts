export interface UserProfile {
  phone?: string | null;

  bio?: string | null;

  country?: string | null;

  address?: string | null;

  date_of_birth?: string | null;

  profile_picture?: string | null;

  profile_picture_url?: string | null;
}

export interface ProfileUser {
  id: number;

  name: string;

  email: string;

  created_at?: string;

  profile: UserProfile;
}

export interface ProfileResponse {
  success: boolean;

  message?: string;

  data?: ProfileUser;

  user?: ProfileUser;
}

export interface ProfilePayload {
  name: string;

  email: string;

  phone?: string;

  bio?: string;

  country?: string;

  address?: string;

  date_of_birth?: string;
}