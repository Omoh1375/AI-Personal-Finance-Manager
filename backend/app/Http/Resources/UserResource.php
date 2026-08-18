<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $profile = $this->profile;

        return [
            'id' => $this->id,

            'name' => $this->name,

            'email' => $this->email,

            'created_at' => $this->created_at,

            'profile' => [
                'phone' => $profile?->phone,

                'bio' => $profile?->bio,

                'country' => $profile?->country,

                'address' => $profile?->address,

                'date_of_birth' => $profile?->date_of_birth?->toDateString(),

                'profile_picture' =>
                    $profile?->profile_picture,

                'profile_picture_url' =>
                    $profile?->profile_picture
                        ? asset('storage/' . $profile->profile_picture)
                        : null,
            ],
        ];
    }
}