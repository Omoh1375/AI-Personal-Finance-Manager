import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  deleteProfilePhoto,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
} from "../api/profile";

import { useAuth } from "../context/AuthContext";

import type {
  ProfilePayload,
} from "../types/profile";

import "./Profile.css";

function formatDate(
  value?: string,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-NG",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );
}

export default function Profile() {
  const queryClient =
    useQueryClient();

  const { user } =
    useAuth();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [saveMessage, setSaveMessage] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [form, setForm] =
    useState<ProfilePayload>({
      name:
        user?.name ?? "",

      email:
        user?.email ?? "",

      phone: "",

      bio: "",

      country: "",

      address: "",

      date_of_birth: "",
    });

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "profile",
    ],

    queryFn: getProfile,
  });

  useEffect(() => {
    if (!profile) {
      return;
    }

    setForm({
      name:
        profile.name ?? "",

      email:
        profile.email ?? "",

      phone:
        profile.profile?.phone ??
        "",

      bio:
        profile.profile?.bio ??
        "",

      country:
        profile.profile?.country ??
        "",

      address:
        profile.profile?.address ??
        "",

      date_of_birth:
        profile.profile
          ?.date_of_birth ??
        "",
    });
  }, [profile]);

  const saveMutation =
    useMutation({
      mutationFn:
        updateProfile,

      onSuccess: (
        updated,
      ) => {
        queryClient.setQueryData(
          [
            "profile",
          ],
          updated,
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "dashboard",
            ],
          },
        );

        setSaveMessage(
          "Profile updated successfully.",
        );

        setFormError("");
      },

      onError: (
        error: any,
      ) => {
        const errors =
          error?.response?.data
            ?.errors;

        const firstError =
          errors
            ? Object.values(
                errors,
              )
                .flat()
                .find(Boolean)
            : null;

        setFormError(
          typeof firstError ===
            "string"
            ? firstError
            : error?.response
                ?.data
                ?.message ??
              "Unable to update profile.",
        );

        setSaveMessage("");
      },
    });

  const photoMutation =
    useMutation({
      mutationFn:
        uploadProfilePhoto,

      onSuccess: (
        updated,
      ) => {
        queryClient.setQueryData(
          [
            "profile",
          ],
          updated,
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "dashboard",
            ],
          },
        );

        setSaveMessage(
          "Profile picture updated successfully.",
        );

        setFormError("");
      },

      onError: (
        error: any,
      ) => {
        setFormError(
          error?.response
            ?.data
            ?.message ??
            "Unable to upload profile picture.",
        );

        setSaveMessage("");
      },
    });

  const deletePhotoMutation =
    useMutation({
      mutationFn:
        deleteProfilePhoto,

      onSuccess: (
        updated,
      ) => {
        queryClient.setQueryData(
          [
            "profile",
          ],
          updated,
        );

        queryClient.invalidateQueries(
          {
            queryKey: [
              "dashboard",
            ],
          },
        );

        setSaveMessage(
          "Profile picture removed successfully.",
        );

        setFormError("");
      },

      onError: (
        error: any,
      ) => {
        setFormError(
          error?.response
            ?.data
            ?.message ??
            "Unable to remove profile picture.",
        );

        setSaveMessage("");
      },
    });

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setSaveMessage("");
    setFormError("");

    saveMutation.mutate(
      form,
    );
  };

  const handlePhotoChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError(
        "Profile picture must not exceed 5MB.",
      );

      event.target.value = "";

      return;
    }

    photoMutation.mutate(
      file,
    );

    event.target.value = "";
  };

  if (isLoading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          <div className="profile-spinner" />

          <p>
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="profile-page">
        <div className="profile-error">
          <h2>
            Unable to load profile
          </h2>

          <p>
            Please refresh and try again.
          </p>
        </div>
      </main>
    );
  }

  const profilePicture =
    profile?.profile
      ?.profile_picture_url;

  const initials =
    profile?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0),
      )
      .join("")
      .toUpperCase() ||
    "U";

  return (
    <main className="profile-page">
      <header className="profile-header">
        <div>
          <p className="profile-eyebrow">
            ACCOUNT PROFILE
          </p>

          <h1>
            My Profile
          </h1>

          <p className="profile-subtitle">
            Manage your personal information and
            profile settings.
          </p>
        </div>
      </header>

      <section className="profile-layout">
        <aside className="profile-sidebar-card">
          <div className="profile-avatar-wrapper">
            {profilePicture ? (
              <img
                src={
                  profilePicture
                }
                alt={
                  profile?.name ??
                  "Profile"
                }
                className="profile-avatar-image"
              />
            ) : (
              <div className="profile-avatar">
                {initials}
              </div>
            )}

            <button
              type="button"
              className="profile-camera-button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={
                photoMutation.isPending
              }
            >
              +
            </button>

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handlePhotoChange
              }
              hidden
            />
          </div>

          <h2>
            {profile?.name}
          </h2>

          <p>
            {profile?.email}
          </p>

          <span className="profile-member-badge">
            Member
          </span>

          {profilePicture && (
            <button
              type="button"
              className="remove-photo-button"
              onClick={() =>
                deletePhotoMutation.mutate()
              }
              disabled={
                deletePhotoMutation.isPending
              }
            >
              Remove photo
            </button>
          )}

          <div className="profile-sidebar-divider" />

          <div className="profile-member-info">
            <span>
              MEMBER SINCE
            </span>

            <strong>
              {formatDate(
                profile?.created_at,
              )}
            </strong>
          </div>
        </aside>

        <section className="profile-main-card">
          <div className="profile-card-heading">
            <div>
              <p>
                PERSONAL INFORMATION
              </p>

              <h2>
                Profile details
              </h2>
            </div>
          </div>

          {formError && (
            <div className="profile-form-error">
              {formError}
            </div>
          )}

          {saveMessage && (
            <div className="profile-form-success">
              {saveMessage}
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
          >
            <div className="profile-form-grid">
              <div className="profile-field">
                <label htmlFor="profile-name">
                  Full name
                </label>

                <input
                  id="profile-name"
                  type="text"
                  value={
                    form.name
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      name:
                        event
                          .target
                          .value,
                    })
                  }
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-email">
                  Email address
                </label>

                <input
                  id="profile-email"
                  type="email"
                  value={
                    form.email
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      email:
                        event
                          .target
                          .value,
                    })
                  }
                  required
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-phone">
                  Phone number
                </label>

                <input
                  id="profile-phone"
                  type="tel"
                  value={
                    form.phone ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      phone:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="e.g. 08012345678"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-country">
                  Country
                </label>

                <input
                  id="profile-country"
                  type="text"
                  value={
                    form.country ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      country:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="Nigeria"
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-date-of-birth">
                  Date of birth
                </label>

                <input
                  id="profile-date-of-birth"
                  type="date"
                  value={
                    form.date_of_birth ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      date_of_birth:
                        event
                          .target
                          .value,
                    })
                  }
                />
              </div>

              <div className="profile-field">
                <label htmlFor="profile-address">
                  Address
                </label>

                <input
                  id="profile-address"
                  type="text"
                  value={
                    form.address ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      address:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="Your address"
                />
              </div>

              <div className="profile-field profile-field-full">
                <label htmlFor="profile-bio">
                  About you
                </label>

                <textarea
                  id="profile-bio"
                  rows={5}
                  value={
                    form.bio ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    setForm({
                      ...form,
                      bio:
                        event
                          .target
                          .value,
                    })
                  }
                  placeholder="Tell us a little about yourself..."
                />
              </div>
            </div>

            <div className="profile-form-actions">
              <button
                type="submit"
                className="profile-save-button"
                disabled={
                  saveMutation.isPending
                }
              >
                {saveMutation.isPending
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </div>
          </form>
        </section>
      </section>

      <section className="profile-security-card">
        <div>
          <p>
            SECURITY
          </p>

          <h2>
            Protect your account
          </h2>

          <span>
            Password and two-factor authentication
            controls will be added here next.
          </span>
        </div>

        <span className="coming-soon-badge">
          Next
        </span>
      </section>
    </main>
  );
}