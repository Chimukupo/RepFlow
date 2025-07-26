import React, { useState, useRef } from 'react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Trash2, Loader2 } from 'lucide-react';

interface ProfilePictureUploadProps {
  onUploadComplete?: (photoURL: string) => void;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ onUploadComplete }) => {
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-pictures/${currentUser.uid}/${Date.now()}_${file.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update user profile in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        photoURL: downloadURL,
        updatedAt: new Date(),
      });

      // Refresh user profile to get updated data
      await refreshUserProfile();
      
      onUploadComplete?.(downloadURL);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async () => {
    if (!currentUser || !userProfile?.photoURL) return;

    setIsDeleting(true);
    setError(null);

    try {
      // Delete from Firebase Storage if it's a Firebase Storage URL
      if (userProfile.photoURL.includes('firebasestorage.googleapis.com')) {
        const photoRef = ref(storage, userProfile.photoURL);
        await deleteObject(photoRef);
      }

      // Update user profile in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        photoURL: null,
        updatedAt: new Date(),
      });

      // Refresh user profile
      await refreshUserProfile();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete profile picture. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = () => {
    if (userProfile?.displayName) {
      return userProfile.displayName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return currentUser?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Profile Picture
        </CardTitle>
        <CardDescription>
          Upload a profile picture to personalize your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar Display */}
          <Avatar className="h-24 w-24">
            <AvatarImage src={userProfile?.photoURL || undefined} alt="Profile picture" />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleFileSelect}
              disabled={isUploading || isDeleting}
              variant="outline"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </>
              )}
            </Button>

            {userProfile?.photoURL && (
              <Button
                onClick={handleDeletePhoto}
                disabled={isUploading || isDeleting}
                variant="outline"
                className="text-red-600 hover:text-red-700"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Upload Guidelines */}
          <div className="text-xs text-gray-500 text-center">
            <p>Supported formats: JPG, PNG, GIF</p>
            <p>Maximum file size: 5MB</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 