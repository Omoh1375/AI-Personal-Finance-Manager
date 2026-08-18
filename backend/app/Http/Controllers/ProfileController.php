<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\UserProfile;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    use ApiResponse;

    public function show(Request $request)
    {
        $user = $request->user();

        $user->load('profile');

        if (!$user->profile) {
            UserProfile::create([
                'user_id' => $user->id,
            ]);

            $user->load('profile');
        }

        return $this->success(
            new UserResource($user)
        );
    }

    public function update(
        ProfileRequest $request
    ) {
        $user = $request->user();

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        $profile = $user->profile()->firstOrCreate([
            'user_id' => $user->id,
        ]);

        $profile->update([
            'phone' => $request->phone,
            'bio' => $request->bio,
            'country' => $request->country,
            'address' => $request->address,
            'date_of_birth' =>
                $request->date_of_birth,
        ]);

        $user->load('profile');

        return $this->success(
            new UserResource($user),
            'Profile updated successfully.'
        );
    }

    public function uploadPhoto(
        Request $request
    ) {
        $request->validate([
            'profile_picture' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $user = $request->user();

        $profile = $user->profile()->firstOrCreate([
            'user_id' => $user->id,
        ]);

        if ($profile->profile_picture) {
            Storage::disk('public')->delete(
                $profile->profile_picture
            );
        }

        $path = $request
            ->file('profile_picture')
            ->store(
                'profile-pictures',
                'public'
            );

        $profile->update([
            'profile_picture' => $path,
        ]);

        $user->load('profile');

        return $this->success(
            new UserResource($user),
            'Profile picture updated successfully.'
        );
    }

    public function deletePhoto(
        Request $request
    ) {
        $user = $request->user();

        $profile = $user->profile;

        if (
            $profile &&
            $profile->profile_picture
        ) {
            Storage::disk('public')->delete(
                $profile->profile_picture
            );

            $profile->update([
                'profile_picture' => null,
            ]);
        }

        $user->load('profile');

        return $this->success(
            new UserResource($user),
            'Profile picture removed successfully.'
        );
    }
}