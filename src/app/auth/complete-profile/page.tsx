"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { createSupabaseClient } from "@/lib/supabase/client";

type ProfileData = {
  id: string;
  full_name: string;
  phone_number: string;
  date_of_birth: string;
  address: string;
  created_at?: string;
  updated_at: string;
};

export default function CompleteProfile() {
  const router = useRouter();
  // const searchParams = new URLSearchParams(window.location.search);
  // const redirectTo = searchParams.get('redirect') || '/';
  const [redirectTo, setRedirectTo] = useState("/");
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
  });

  console.log("Complete Profile - Redirect URL:", redirectTo);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setRedirectTo(searchParams.get("redirect") || "/");
    }
  }, []);

  // Debug log the auth state
  useEffect(() => {
    console.log("Complete Profile - Auth State:", {
      user: user ? { id: user.id, email: user.email } : null,
      authLoading,
    });
  }, [user, authLoading]);

  // Wait for auth to initialize before redirecting
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        console.log("No authenticated user, redirecting to signin");
        router.push("/auth/signin");
      } else {
        console.log("User is authenticated:", user.email);
      }
    }
  }, [user, router, authLoading]);

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      throw new Error("Please enter your full name");
    }
    if (!formData.phoneNumber.trim()) {
      throw new Error("Please enter your phone number");
    }
    if (!formData.dateOfBirth.trim()) {
      throw new Error("Please enter your date of birth");
    }
    if (!formData.address.trim()) {
      throw new Error("Please enter your address");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!user) {
        throw new Error("Please sign in to complete your profile");
      }

      // Validate form data
      validateForm();

      const supabase = createSupabaseClient();
      console.log("Updating profile for user:", user.id);

      // First check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 means no rows returned
        console.error("Error fetching profile:", fetchError);
        throw new Error("Failed to check existing profile");
      }

      // Prepare profile data
      const profileData: ProfileData = {
        id: user.id,
        full_name: formData.fullName.trim(),
        phone_number: formData.phoneNumber.trim(),
        date_of_birth: formData.dateOfBirth,
        address: formData.address.trim(),
        updated_at: new Date().toISOString(),
      };

      // If no profile exists, include created_at
      if (!existingProfile) {
        profileData.created_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(profileData, {
          onConflict: "id",
          ignoreDuplicates: false,
        });

      if (updateError) {
        console.error("Profile update error:", updateError);
        throw updateError;
      }

      console.log("Profile updated successfully");
      setSuccess("Profile completed successfully! Redirecting...");
      // Wait briefly to show success message before redirecting
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // Redirect to the original destination
      console.log("Redirecting to:", redirectTo);
      router.replace(redirectTo);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please provide your details to complete your registration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="appearance-none block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="appearance-none block w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-700"
              >
                Date of Birth
              </label>
              <div className="mt-1">
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={loading}
                  max={new Date().toISOString().split("T")[0]}
                  className="appearance-none block w-full px-3 text-gray-700 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <div className="mt-1">
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  required
                  placeholder="Enter your full address"
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="appearance-none block w-full px-3 text-gray-700 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? "Saving..." : "Complete Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
