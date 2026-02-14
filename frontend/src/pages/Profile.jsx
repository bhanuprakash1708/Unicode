import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Cpu, HardDrive, User, Mail, Check, X, Save, Edit, Loader2, MapPin, Github, Linkedin, BookOpen, VenetianMask } from 'lucide-react';
import { UserAuth } from '../context/AuthContext';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { MdVerified } from "react-icons/md";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.3, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function Profile() {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    gender: '',
    location: '',
    education: '',
    github: '',
    linkedin: '',
    codeforces_username: '',
    codechef_username: '',
    leetcode_username: '',
  });
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editableFields, setEditableFields] = useState({
    name: false,
    email: false,
    gender: false,
    location: false,
    education: false,
    github: false,
    linkedin: false,
    codeforces_username: false,
    codechef_username: false,
    leetcode_username: false,
  });
  const { session } = UserAuth();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE}/api/users/${session.user.id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            navigate('/profileform');
            return;
          }
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }

        const responseData = await response.json();
        const data = Array.isArray(responseData) ? responseData[0] : responseData;

        setProfileData(data);
        setInitialData(data);

        if (!data) {
          navigate('/profileform');
        } else {
          const authEmail = session.user.email;
          if (data.email !== authEmail) {
            const updateResponse = await fetch(`${API_BASE}/api/users/${session.user.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                email: authEmail,
              }),
            });

            if (!updateResponse.ok) throw new Error('Failed to update email');

            const updatedData = { ...data, email: authEmail };
            setProfileData(updatedData);
            setInitialData(updatedData);
            setSuccess('Email updated successfully!');
          }
        }
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [API_BASE, session, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
  };

  const toggleEdit = (field) => {
    setEditableFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const cancelEdit = () => {
    setProfileData(initialData);
    setEditableFields({
      name: false,
      email: false,
      gender: false,
      location: false,
      education: false,
      github: false,
      linkedin: false,
      codeforces_username: false,
      codechef_username: false,
      leetcode_username: false,
    });
    setError(null);
    setSuccess(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      if (!profileData.name.trim()) {
        throw new Error('Name cannot be empty');
      }

      const response = await fetch(`${API_BASE}/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedData = await response.json();
      setInitialData(updatedData);
      setSuccess('Profile updated successfully!');
      setEditableFields({
        name: false,
        email: false,
        gender: false,
        location: false,
        education: false,
        github: false,
        linkedin: false,
        codeforces_username: false,
        codechef_username: false,
        leetcode_username: false,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(profileData) !== JSON.stringify(initialData);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-app flex flex-col items-center justify-center text-[var(--text-primary)]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-[var(--text-muted)]">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app flex flex-col text-[var(--text-primary)]">
      <Header />
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h2
            className="mt-6 text-3xl font-extrabold text-[var(--text-primary)]"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            My Profile
          </motion.h2>
        </div>

        <motion.div
          className="mt-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="rounded-2xl border border-[var(--border-muted)] bg-[var(--surface)] px-6 py-8 shadow-lg backdrop-blur-sm">
            {error && (
              <motion.div
                className="mb-6 border border-red-500/40 bg-red-500/10 text-red-300 px-4 py-3 rounded-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center">
                  <X className="h-5 w-5 mr-2" />
                  {error}
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div
                className="mb-6 border border-green-500/40 bg-green-500/10 text-green-300 px-4 py-3 rounded-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  {success}
                </div>
              </motion.div>
            )}

            <motion.form className="space-y-6" onSubmit={handleSave} variants={containerVariants}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information Column */}
                <div className="space-y-6">
                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center">
                      <label htmlFor="name" className="block text-sm font-medium text-[var(--text-muted)]">
                        Full Name
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleEdit('name')}
                        className="text-[var(--brand-color)] hover:opacity-80"
                      >
                        {editableFields.name ? (
                          <X className="h-4 w-4" onClick={() => cancelEdit()} />
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-[var(--text-muted)]" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={profileData.name}
                        onChange={handleChange}
                        readOnly={!editableFields.name}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
                          editableFields.name
                            ? 'bg-[var(--surface-strong)] text-[var(--text-primary)] border-[var(--border-muted)]'
                            : 'bg-[var(--surface-muted)] text-[var(--text-muted)] cursor-not-allowed border-[var(--border-muted)]'
                        } sm:text-sm`}
                        required
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center">
                      <label htmlFor="email" className="block text-sm font-medium text-[var(--text-muted)]">
                        Email
                      </label>
                      <div className="flex items-center">
                        <span className="mr-1 text-xs text-green-400">Verified</span>
                        <MdVerified className="h-4 w-4 text-green-400" />
                      </div>
                    </div>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-[var(--text-muted)]" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        readOnly={true}
                        className="block w-full pl-10 pr-3 py-2 bg-[var(--surface-muted)] text-[var(--text-muted)] rounded-md border border-[var(--border-muted)] cursor-not-allowed sm:text-sm"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center">
                      <label htmlFor="gender" className="block text-sm font-medium text-[var(--text-muted)]">
                        Gender
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleEdit('gender')}
                        className="text-[var(--brand-color)] hover:opacity-80"
                      >
                        {editableFields.gender ? (
                          <X className="h-4 w-4" onClick={() => cancelEdit()} />
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <VenetianMask className="h-5 w-5 text-[var(--text-muted)]" />
                      </div>
                      <input
                        id="gender"
                        name="gender"
                        type="text"
                        value={profileData.gender}
                        onChange={handleChange}
                        readOnly={!editableFields.gender}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
                          editableFields.gender
                            ? 'bg-[var(--surface-strong)] text-[var(--text-primary)] border-[var(--border-muted)]'
                            : 'bg-[var(--surface-muted)] text-[var(--text-muted)] cursor-not-allowed border-[var(--border-muted)]'
                        } sm:text-sm`}
                        placeholder="e.g. Male, Female, Non-binary"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center">
                      <label htmlFor="location" className="block text-sm font-medium text-[var(--text-muted)]">
                        Location
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleEdit('location')}
                        className="text-[var(--brand-color)] hover:opacity-80"
                      >
                        {editableFields.location ? (
                          <X className="h-4 w-4" onClick={() => cancelEdit()} />
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-[var(--text-muted)]" />
                      </div>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={profileData.location}
                        onChange={handleChange}
                        readOnly={!editableFields.location}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
                          editableFields.location
                            ? 'bg-[var(--surface-strong)] text-[var(--text-primary)] border-[var(--border-muted)]'
                            : 'bg-[var(--surface-muted)] text-[var(--text-muted)] cursor-not-allowed border-[var(--border-muted)]'
                        } sm:text-sm`}
                        placeholder="e.g. New York, USA"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center">
                      <label htmlFor="education" className="block text-sm font-medium text-[var(--text-muted)]">
                        Education
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleEdit('education')}
                        className="text-[var(--brand-color)] hover:opacity-80"
                      >
                        {editableFields.education ? (
                          <X className="h-4 w-4" onClick={() => cancelEdit()} />
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BookOpen className="h-5 w-5 text-[var(--text-muted)]" />
                      </div>
                      <input
                        id="education"
                        name="education"
                        type="text"
                        value={profileData.education}
                        onChange={handleChange}
                        readOnly={!editableFields.education}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
                          editableFields.education
                            ? 'bg-[var(--surface-strong)] text-[var(--text-primary)] border-[var(--border-muted)]'
                            : 'bg-[var(--surface-muted)] text-[var(--text-muted)] cursor-not-allowed border-[var(--border-muted)]'
                        } sm:text-sm`}
                        placeholder="e.g. University of Example, BSc Computer Science"
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Social & Coding Profiles Column */}
                <div className="space-y-6">
                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center">
                      <label htmlFor="github" className="block text-sm font-medium text-[var(--text-muted)]">
                        GitHub Username
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleEdit('github')}
                        className="text-[var(--brand-color)] hover:opacity-80"
                      >
                        {editableFields.github ? (
                          <X className="h-4 w-4" onClick={() => cancelEdit()} />
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Github className="h-5 w-5 text-[var(--text-muted)]" />
                      </div>
                      <input
                        id="github"
                        name="github"
                        type="text"
                        value={profileData.github}
                        onChange={handleChange}
                        readOnly={!editableFields.github}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
                          editableFields.github
                            ? 'bg-[var(--surface-strong)] text-[var(--text-primary)] border-[var(--border-muted)]'
                            : 'bg-[var(--surface-muted)] text-[var(--text-muted)] cursor-not-allowed border-[var(--border-muted)]'
                        } sm:text-sm`}
                        placeholder="your GitHub username"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <div className="flex justify-between items-center">
                      <label htmlFor="linkedin" className="block text-sm font-medium text-[var(--text-muted)]">
                        LinkedIn Profile
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleEdit('linkedin')}
                        className="text-[var(--brand-color)] hover:opacity-80"
                      >
                        {editableFields.linkedin ? (
                          <X className="h-4 w-4" onClick={() => cancelEdit()} />
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Linkedin className="h-5 w-5 text-[var(--text-muted)]" />
                      </div>
                      <input
                        id="linkedin"
                        name="linkedin"
                        type="text"
                        value={profileData.linkedin}
                        onChange={handleChange}
                        readOnly={!editableFields.linkedin}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
                          editableFields.linkedin
                            ? 'bg-[var(--surface-strong)] text-[var(--text-primary)] border-[var(--border-muted)]'
                            : 'bg-[var(--surface-muted)] text-[var(--text-muted)] cursor-not-allowed border-[var(--border-muted)]'
                        } sm:text-sm`}
                        placeholder="your LinkedIn username or profile URL"
                      />
                    </div>
                  </motion.div>

                  {/* Coding Profiles */}
                  {[
                    { id: 'codeforces_username', icon: Code, label: 'Codeforces Username', maxLength: 24 },
                    { id: 'codechef_username', icon: Cpu, label: 'CodeChef Username', maxLength: 24 },
                    { id: 'leetcode_username', icon: HardDrive, label: 'LeetCode Username', maxLength: 24 },
                  ].map(({ id, icon: Icon, label, maxLength }) => (
                    <motion.div key={id} variants={itemVariants}>
                      <div className="flex justify-between items-center">
                        <label htmlFor={id} className="block text-sm font-medium text-[var(--text-muted)]">
                          {label}
                        </label>
                        <button
                          type="button"
                          onClick={() => toggleEdit(id)}
                          className="text-[var(--brand-color)] hover:opacity-80"
                        >
                          {editableFields[id] ? (
                            <X className="h-4 w-4" onClick={() => cancelEdit()} />
                          ) : (
                            <Edit className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Icon className="h-5 w-5 text-[var(--text-muted)]" />
                        </div>
                        <input
                          id={id}
                          name={id}
                          type="text"
                          value={profileData[id]}
                          onChange={handleChange}
                          readOnly={!editableFields[id]}
                          maxLength={maxLength}
                          className={`block w-full pl-10 pr-3 py-2 border rounded-md ${
                            editableFields[id]
                              ? 'bg-[var(--surface-strong)] text-[var(--text-primary)] border-[var(--border-muted)]'
                              : 'bg-[var(--surface-muted)] text-[var(--text-muted)] cursor-not-allowed border-[var(--border-muted)]'
                          } sm:text-sm`}
                          placeholder={`${label}`}
                        />
                      </div>
                      {editableFields[id] && (
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {profileData[id]?.length || 0}/{maxLength} characters
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex justify-end items-center pt-6 border-t border-[var(--border-muted)]"
              >
                <div className="flex space-x-2">
                  {hasChanges && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center rounded-md border border-[var(--border-muted)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] shadow-sm transition-colors hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!hasChanges || isSaving}
                    className={`inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      !hasChanges || isSaving
                        ? 'bg-[var(--text-muted)]/60 cursor-not-allowed focus:ring-[var(--ring)]'
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    } transition-colors`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}


