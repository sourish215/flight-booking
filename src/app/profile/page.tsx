"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { createSupabaseClient } from "@/lib/supabase/client";

interface ProfileData {
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<ProfileData>({
    fullName: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: "",
  });

  useEffect(() => {
    const loadProfileData = async () => {
      console.log("Loading profile data...");
      try {
        setLoading(true);
        const supabase = createSupabaseClient();

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user!.id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            fullName: data.full_name?.toString() || "",
            phoneNumber: data.phone_number?.toString() || "",
            dateOfBirth: data.date_of_birth?.toString() || "",
            address: data.address?.toString() || "",
          });
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        console.log("No authenticated user, redirecting to signin");
        router.push("/auth/signin");
      } else {
        loadProfileData();
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
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (!user) {
        throw new Error("Please sign in to update your profile");
      }

      validateForm();

      const supabase = createSupabaseClient();
      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: formData.fullName.trim(),
        phone_number: formData.phoneNumber.trim(),
        date_of_birth: formData.dateOfBirth,
        address: formData.address.trim(),
        updated_at: new Date().toISOString(),
      });

      if (updateError) throw updateError;

      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          View and update your profile information
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

          <form onSubmit={handleSubmit} className="space-y-6 text-gray-600">
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
                  disabled={saving}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={saving}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={saving}
                  max={new Date().toISOString().split("T")[0]}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                  disabled={saving}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={saving}
                className="w-full cursor-pointer flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {saving ? "Saving..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
