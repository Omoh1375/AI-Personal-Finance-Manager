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
  Link,
} from "react-router-dom";

import {
  deleteProfilePhoto,
  getProfile,
  updateProfile,
  uploadProfilePhoto,
} from "../api/profile";

import {
  useAuth,
} from "../context/AuthContext";

import type {
  ProfilePayload,
} from "../types/profile";

import "./Profile.css";

/* ==========================================================================
   HELPERS
   ========================================================================== */

function formatDate(
  value?: string | null,
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

/* ==========================================================================
   ICONS
   ========================================================================== */

function CameraIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M4 7h3l1.5-2h7L17 7h3v11H4V7Z" />

      <circle
        cx="12"
        cy="12"
        r="3.5"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="4"
      />

      <path d="M4 20c.8-4 3.3-6 8-6s7.2 2 8 6" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
      />

      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="7"
        y="3"
        width="10"
        height="18"
        rx="2"
      />

      <path d="M10 6h4" />

      <circle
        cx="12"
        cy="17.5"
        r=".8"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
      />

      <path d="M3 12h18" />

      <path d="M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="5"
        width="16"
        height="15"
        rx="2"
      />

      <path d="M8 3v4M16 3v4M4 10h16" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

      <circle
        cx="12"
        cy="10"
        r="2.5"
      />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M6 3h9l3 3v15H6V3Z" />

      <path d="M15 3v4h4" />

      <path d="M9 12h6M9 16h6M9 8h2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 3 20 6v6c0 5-3.4 8.1-8 9-4.6-.9-8-4-8-9V6l8-3Z" />

      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

/* ==========================================================================
   PROFILE PAGE
   ========================================================================== */

export default function Profile() {
  const queryClient =
    useQueryClient();

  const {
    user,
    updateUser,
  } = useAuth();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    saveMessage,
    setSaveMessage,
  ] = useState("");

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState<ProfilePayload>({
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

  /* ------------------------------------------------------------------------
     PROFILE QUERY
  ------------------------------------------------------------------------ */

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "profile",
    ],

    queryFn:
      getProfile,
  });

  /* ------------------------------------------------------------------------
     HYDRATE FORM
  ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------
     SAVE PROFILE
  ------------------------------------------------------------------------ */

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

        queryClient.invalidateQueries({
          queryKey: [
            "dashboard",
          ],
        });

        updateUser(updated);

        setSaveMessage(
          "Profile updated successfully.",
        );

        setFormError("");
      },

      onError: (
        error: any,
      ) => {
        const errors =
          error?.response
            ?.data?.errors;

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
                ?.data?.message ??
              "Unable to update profile.",
        );

        setSaveMessage("");
      },
    });

  /* ------------------------------------------------------------------------
     UPLOAD PHOTO
  ------------------------------------------------------------------------ */

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

        queryClient.invalidateQueries({
          queryKey: [
            "dashboard",
          ],
        });

        updateUser(updated);

        setSaveMessage(
          "Profile picture updated successfully.",
        );

        setFormError("");
      },

      onError: (
        error: any,
      ) => {
        const errors =
          error?.response
            ?.data?.errors;

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
                ?.data?.message ??
              "Unable to upload profile picture.",
        );

        setSaveMessage("");
      },
    });

  /* ------------------------------------------------------------------------
     DELETE PHOTO
  ------------------------------------------------------------------------ */

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

        queryClient.invalidateQueries({
          queryKey: [
            "dashboard",
          ],
        });

        updateUser(updated);

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
            ?.data?.message ??
            "Unable to remove profile picture.",
        );

        setSaveMessage("");
      },
    });

  /* ------------------------------------------------------------------------
     SAVE
  ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------
     PHOTO CHANGE
  ------------------------------------------------------------------------ */

  const handlePhotoChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setSaveMessage("");
    setFormError("");

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(
        file.type,
      )
    ) {
      setFormError(
        "Please choose a JPG, PNG, or WebP image.",
      );

      event.target.value =
        "";

      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setFormError(
        "Profile picture must not exceed 5MB.",
      );

      event.target.value =
        "";

      return;
    }

    photoMutation.mutate(
      file,
    );

    event.target.value =
      "";
  };

  /* ------------------------------------------------------------------------
     LOADING
  ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------
     ERROR
  ------------------------------------------------------------------------ */

  if (
    isError ||
    !profile
  ) {
    return (
      <main className="profile-page">
        <div className="profile-error">
          <div className="profile-error-icon">
            !
          </div>

          <h2>
            Unable to load profile
          </h2>

          <p>
            Please refresh the page and try again.
          </p>

          <button
            type="button"
            className="profile-retry-button"
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: [
                  "profile",
                ],
              })
            }
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------
     DISPLAY VALUES
  ------------------------------------------------------------------------ */

  const profilePicture =
    profile.profile
      ?.profile_picture_url;

  const initials =
    profile.name
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

  const photoBusy =
    photoMutation.isPending ||
    deletePhotoMutation.isPending;

  const saveBusy =
    saveMutation.isPending;

  return (
    <main className="profile-page">
      {/* ================================================================
          HEADER
      ================================================================= */}

      <header className="profile-header">
        <div>
          <p className="profile-eyebrow">
            ACCOUNT PROFILE
          </p>

          <h1>
            My Profile
          </h1>

          <p className="profile-subtitle">
            Manage your personal information, profile
            picture and account preferences.
          </p>
        </div>

        <div className="profile-header-status">
          <span />

          Account active
        </div>
      </header>

      {/* ================================================================
          GLOBAL FEEDBACK
      ================================================================= */}

      {(formError ||
        saveMessage) && (
        <div
          className={`profile-feedback ${
            formError
              ? "error"
              : "success"
          }`}
        >
          <strong>
            {formError
              ? "Something needs your attention"
              : "Profile updated"}
          </strong>

          <span>
            {formError ||
              saveMessage}
          </span>
        </div>
      )}

      {/* ================================================================
          PROFILE LAYOUT
      ================================================================= */}

      <section className="profile-layout">
        {/* ================================================================
            SIDEBAR
        ================================================================= */}

        <aside className="profile-sidebar-card">
          <div className="profile-avatar-wrapper">
            {profilePicture ? (
              <img
                src={
                  profilePicture
                }
                alt={
                  profile.name ??
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
                photoBusy
              }
              aria-label="Change profile picture"
              title="Change profile picture"
            >
              {photoMutation.isPending ? (
                <span className="profile-mini-spinner" />
              ) : (
                <CameraIcon />
              )}
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
            {profile.name}
          </h2>

          <p>
            {profile.email}
          </p>

          <span className="profile-member-badge">
            Personal account
          </span>

          <p className="profile-photo-help">
            JPG, PNG or WebP · Maximum 5MB
          </p>

          {profilePicture && (
            <button
              type="button"
              className="remove-photo-button"
              onClick={() =>
                deletePhotoMutation.mutate()
              }
              disabled={
                photoBusy
              }
            >
              {deletePhotoMutation.isPending
                ? "Removing..."
                : "Remove photo"}
            </button>
          )}

          <div className="profile-sidebar-divider" />

          <div className="profile-member-info">
            <span>
              MEMBER SINCE
            </span>

            <strong>
              {formatDate(
                profile.created_at,
              )}
            </strong>
          </div>
        </aside>

        {/* ================================================================
            MAIN PROFILE CARD
        ================================================================= */}

        <section className="profile-main-card">
          <div className="profile-card-heading">
            <div className="profile-section-icon">
              <UserIcon />
            </div>

            <div>
              <p>
                PERSONAL INFORMATION
              </p>

              <h2>
                Profile details
              </h2>

              <span>
                Keep your account information accurate
                and up to date.
              </span>
            </div>
          </div>

          <form
            onSubmit={
              handleSubmit
            }
          >
            <div className="profile-form-grid">
              {/* Full name */}

              <div className="profile-field">
                <label htmlFor="profile-name">
                  Full name
                </label>

                <div className="profile-input">
                  <UserIcon />

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
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* Email */}

              <div className="profile-field">
                <label htmlFor="profile-email">
                  Email address
                </label>

                <div className="profile-input">
                  <MailIcon />

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
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Phone */}

              <div className="profile-field">
                <label htmlFor="profile-phone">
                  Phone number
                </label>

                <div className="profile-input">
                  <PhoneIcon />

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
                    autoComplete="tel"
                    placeholder="e.g. 08012345678"
                  />
                </div>
              </div>

              {/* Country */}

              <div className="profile-field">
                <label htmlFor="profile-country">
                  Country
                </label>

                <div className="profile-input">
                  <GlobeIcon />

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
                    autoComplete="country-name"
                  />
                </div>
              </div>

              {/* Date of birth */}

              <div className="profile-field">
                <label htmlFor="profile-date-of-birth">
                  Date of birth
                </label>

                <div className="profile-input">
                  <CalendarIcon />

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
              </div>

              {/* Address */}

              <div className="profile-field">
                <label htmlFor="profile-address">
                  Address
                </label>

                <div className="profile-input">
                  <MapPinIcon />

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
                    autoComplete="street-address"
                  />
                </div>
              </div>

              {/* Bio */}

              <div className="profile-field profile-field-full">
                <label htmlFor="profile-bio">
                  About you
                </label>

                <div className="profile-textarea">
                  <FileTextIcon />

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
            </div>

            <div className="profile-form-actions">
              <button
                type="submit"
                className="profile-save-button"
                disabled={
                  saveBusy
                }
              >
                {saveBusy ? (
                  <>
                    <span className="profile-button-spinner" />

                    Saving changes...
                  </>
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </form>
        </section>
      </section>

      {/* ================================================================
          SECURITY
      ================================================================= */}

      <section className="profile-security-card">
        <div className="profile-security-main">
          <div className="profile-security-icon">
            <ShieldIcon />
          </div>

          <div>
            <p>
              ACCOUNT SECURITY
            </p>

            <h2>
              Protect your account
            </h2>

            <span>
              Manage your password, two-factor
              authentication and recovery codes.
            </span>
          </div>
        </div>

        <Link
          to="/security"
          className="profile-security-link"
        >
          <span>
            Security settings
          </span>

          <ChevronIcon />
        </Link>
      </section>
    </main>
  );
}