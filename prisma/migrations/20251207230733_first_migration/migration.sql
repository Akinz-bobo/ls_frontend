/*
  Warnings:

  - A unique constraint covering the columns `[userId,podcastEpisodeId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,archiveId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[staffId,audiobookId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[staffId,podcastId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[staffId,podcastEpisodeId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[staffId,archiveId]` on the table `Favorite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,audiobookId]` on the table `PlaybackProgress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,podcastId]` on the table `PlaybackProgress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,archiveId]` on the table `PlaybackProgress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[staffId,audiobookId]` on the table `PlaybackProgress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[staffId,podcastId]` on the table `PlaybackProgress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[staffId,archiveId]` on the table `PlaybackProgress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,archiveId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PodcastStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EpisodeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SettingsCategory" AS ENUM ('GENERAL', 'BROADCAST', 'CONTENT', 'NOTIFICATIONS', 'SECURITY', 'ANALYTICS', 'API', 'BACKUP', 'MODERATION');

-- CreateEnum
CREATE TYPE "ArchiveType" AS ENUM ('PODCAST', 'BROADCAST', 'AUDIOBOOK', 'INTERVIEW', 'TALK_SHOW', 'MUSIC_SHOW', 'NEWS', 'DOCUMENTARY', 'SERIES');

-- CreateEnum
CREATE TYPE "ArchiveStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'HIDDEN', 'FEATURED');

-- AlterEnum
ALTER TYPE "BroadcastStatus" ADD VALUE 'READY';

-- AlterEnum
ALTER TYPE "ScheduleStatus" ADD VALUE 'PUBLISHED';

-- DropForeignKey
ALTER TABLE "public"."Favorite" DROP CONSTRAINT "Favorite_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PlaybackProgress" DROP CONSTRAINT "PlaybackProgress_userId_fkey";

-- AlterTable
ALTER TABLE "Bookmark" ADD COLUMN     "archiveId" TEXT;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "archiveId" TEXT,
ADD COLUMN     "podcastEpisodeId" TEXT;

-- AlterTable
ALTER TABLE "Favorite" ADD COLUMN     "archiveId" TEXT,
ADD COLUMN     "podcastEpisodeId" TEXT,
ADD COLUMN     "staffId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PlaybackProgress" ADD COLUMN     "archiveId" TEXT,
ADD COLUMN     "chapterId" TEXT,
ADD COLUMN     "podcastEpisodeId" TEXT,
ADD COLUMN     "staffId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN     "status" "PodcastStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "coverImage" DROP NOT NULL,
ALTER COLUMN "audioFile" DROP NOT NULL,
ALTER COLUMN "duration" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "archiveId" TEXT;

-- CreateTable
CREATE TABLE "PodcastEpisode" (
    "id" TEXT NOT NULL,
    "podcastId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "episodeNumber" INTEGER NOT NULL,
    "audioFile" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "status" "EpisodeStatus" NOT NULL DEFAULT 'DRAFT',
    "transcript" TEXT,
    "transcriptFile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PodcastEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "userAvatar" TEXT,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'user',
    "replyTo" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isModerated" BOOLEAN NOT NULL DEFAULT false,
    "moderationReason" TEXT,
    "moderatedBy" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "likedBy" TEXT,
    "emojis" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamSession" (
    "id" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "streamKey" TEXT NOT NULL,
    "streamUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'STARTING',
    "config" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreamSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatModerationAction" (
    "id" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "messageId" TEXT,
    "targetUserId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "reason" TEXT,
    "duration" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatModerationAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatUserSession" (
    "id" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "userAvatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'listener',
    "isOnline" BOOLEAN NOT NULL DEFAULT true,
    "isTyping" BOOLEAN NOT NULL DEFAULT false,
    "isMuted" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "violations" INTEGER NOT NULL DEFAULT 0,
    "leftAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatUserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListenerAnalytics" (
    "id" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "listenerCount" INTEGER NOT NULL,
    "peakListeners" INTEGER NOT NULL DEFAULT 0,
    "geoData" TEXT,
    "deviceData" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListenerAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_settings" (
    "id" TEXT NOT NULL,
    "dashboardTitle" TEXT NOT NULL DEFAULT 'Radio Dashboard',
    "organizationName" TEXT NOT NULL DEFAULT 'Internet Radio Station',
    "logoUrl" TEXT,
    "faviconUrl" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#64748b',
    "defaultBroadcastQuality" TEXT NOT NULL DEFAULT 'HD',
    "defaultStreamDelay" INTEGER NOT NULL DEFAULT 5,
    "maxConcurrentListeners" INTEGER NOT NULL DEFAULT 1000,
    "autoRecordBroadcasts" BOOLEAN NOT NULL DEFAULT false,
    "enableChatModeration" BOOLEAN NOT NULL DEFAULT true,
    "defaultRecordingFormat" TEXT NOT NULL DEFAULT 'MP3',
    "defaultAudioQuality" TEXT NOT NULL DEFAULT '128kbps',
    "allowFileUploads" BOOLEAN NOT NULL DEFAULT true,
    "maxFileUploadSize" INTEGER NOT NULL DEFAULT 104857600,
    "allowedFileTypes" TEXT NOT NULL DEFAULT 'mp3,wav,flac,m4a',
    "enableTranscription" BOOLEAN NOT NULL DEFAULT true,
    "autoGenerateTranscripts" BOOLEAN NOT NULL DEFAULT false,
    "enableEmailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "enableSMSNotifications" BOOLEAN NOT NULL DEFAULT false,
    "enableSlackNotifications" BOOLEAN NOT NULL DEFAULT false,
    "notificationEmail" TEXT,
    "slackWebhookUrl" TEXT,
    "smsProviderConfig" TEXT,
    "enableTwoFactorAuth" BOOLEAN NOT NULL DEFAULT false,
    "sessionTimeout" INTEGER NOT NULL DEFAULT 3600,
    "passwordMinLength" INTEGER NOT NULL DEFAULT 8,
    "requirePasswordComplexity" BOOLEAN NOT NULL DEFAULT true,
    "maxLoginAttempts" INTEGER NOT NULL DEFAULT 5,
    "lockoutDuration" INTEGER NOT NULL DEFAULT 900,
    "enableAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "analyticsProvider" TEXT NOT NULL DEFAULT 'internal',
    "enableErrorReporting" BOOLEAN NOT NULL DEFAULT true,
    "enablePerformanceMonitoring" BOOLEAN NOT NULL DEFAULT true,
    "dataRetentionDays" INTEGER NOT NULL DEFAULT 90,
    "enablePublicAPI" BOOLEAN NOT NULL DEFAULT false,
    "apiRateLimit" INTEGER NOT NULL DEFAULT 1000,
    "enableWebhooks" BOOLEAN NOT NULL DEFAULT false,
    "webhookSigningSecret" TEXT,
    "enableAutomaticBackups" BOOLEAN NOT NULL DEFAULT true,
    "backupFrequency" TEXT NOT NULL DEFAULT 'daily',
    "backupRetentionDays" INTEGER NOT NULL DEFAULT 30,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT,
    "enableContentModeration" BOOLEAN NOT NULL DEFAULT true,
    "autoFlagInappropriate" BOOLEAN NOT NULL DEFAULT true,
    "requireContentApproval" BOOLEAN NOT NULL DEFAULT false,
    "moderationKeywords" TEXT,
    "systemVersion" TEXT,
    "lastUpdatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Archive" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "host" TEXT,
    "guests" TEXT,
    "category" TEXT,
    "type" "ArchiveType" NOT NULL,
    "status" "ArchiveStatus" NOT NULL DEFAULT 'ACTIVE',
    "duration" INTEGER,
    "fileSize" INTEGER,
    "audioFile" TEXT,
    "downloadUrl" TEXT,
    "coverImage" TEXT,
    "thumbnailImage" TEXT,
    "originalAirDate" TIMESTAMP(3),
    "archivedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isDownloadable" BOOLEAN NOT NULL DEFAULT true,
    "isExclusive" BOOLEAN NOT NULL DEFAULT false,
    "accessLevel" TEXT NOT NULL DEFAULT 'PUBLIC',
    "tags" TEXT,
    "metadata" TEXT,
    "transcript" TEXT,
    "transcriptFile" TEXT,
    "qualityVariants" TEXT,
    "podcastId" TEXT,
    "audiobookId" TEXT,
    "broadcastId" TEXT,
    "episodeId" TEXT,
    "createdById" TEXT NOT NULL,
    "curatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Archive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PodcastEpisode_podcastId_idx" ON "PodcastEpisode"("podcastId");

-- CreateIndex
CREATE UNIQUE INDEX "PodcastEpisode_podcastId_episodeNumber_key" ON "PodcastEpisode"("podcastId", "episodeNumber");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "EventRegistration_userId_idx" ON "EventRegistration"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRegistration_userId_eventId_key" ON "EventRegistration"("userId", "eventId");

-- CreateIndex
CREATE INDEX "ChatMessage_broadcastId_idx" ON "ChatMessage"("broadcastId");

-- CreateIndex
CREATE INDEX "ChatMessage_timestamp_idx" ON "ChatMessage"("timestamp");

-- CreateIndex
CREATE INDEX "ChatMessage_userId_idx" ON "ChatMessage"("userId");

-- CreateIndex
CREATE INDEX "ChatMessage_messageType_idx" ON "ChatMessage"("messageType");

-- CreateIndex
CREATE UNIQUE INDEX "StreamSession_streamKey_key" ON "StreamSession"("streamKey");

-- CreateIndex
CREATE INDEX "StreamSession_broadcastId_idx" ON "StreamSession"("broadcastId");

-- CreateIndex
CREATE INDEX "StreamSession_streamKey_idx" ON "StreamSession"("streamKey");

-- CreateIndex
CREATE INDEX "ChatModerationAction_broadcastId_idx" ON "ChatModerationAction"("broadcastId");

-- CreateIndex
CREATE INDEX "ChatModerationAction_targetUserId_idx" ON "ChatModerationAction"("targetUserId");

-- CreateIndex
CREATE INDEX "ChatModerationAction_moderatorId_idx" ON "ChatModerationAction"("moderatorId");

-- CreateIndex
CREATE INDEX "ChatModerationAction_actionType_idx" ON "ChatModerationAction"("actionType");

-- CreateIndex
CREATE INDEX "ChatUserSession_broadcastId_idx" ON "ChatUserSession"("broadcastId");

-- CreateIndex
CREATE INDEX "ChatUserSession_userId_idx" ON "ChatUserSession"("userId");

-- CreateIndex
CREATE INDEX "ChatUserSession_isOnline_idx" ON "ChatUserSession"("isOnline");

-- CreateIndex
CREATE UNIQUE INDEX "ChatUserSession_broadcastId_userId_key" ON "ChatUserSession"("broadcastId", "userId");

-- CreateIndex
CREATE INDEX "ListenerAnalytics_broadcastId_idx" ON "ListenerAnalytics"("broadcastId");

-- CreateIndex
CREATE INDEX "ListenerAnalytics_timestamp_idx" ON "ListenerAnalytics"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Archive_slug_key" ON "Archive"("slug");

-- CreateIndex
CREATE INDEX "Archive_type_idx" ON "Archive"("type");

-- CreateIndex
CREATE INDEX "Archive_status_idx" ON "Archive"("status");

-- CreateIndex
CREATE INDEX "Archive_originalAirDate_idx" ON "Archive"("originalAirDate");

-- CreateIndex
CREATE INDEX "Archive_archivedDate_idx" ON "Archive"("archivedDate");

-- CreateIndex
CREATE INDEX "Archive_category_idx" ON "Archive"("category");

-- CreateIndex
CREATE INDEX "Archive_createdById_idx" ON "Archive"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_podcastEpisodeId_key" ON "Favorite"("userId", "podcastEpisodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_archiveId_key" ON "Favorite"("userId", "archiveId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_staffId_audiobookId_key" ON "Favorite"("staffId", "audiobookId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_staffId_podcastId_key" ON "Favorite"("staffId", "podcastId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_staffId_podcastEpisodeId_key" ON "Favorite"("staffId", "podcastEpisodeId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_staffId_archiveId_key" ON "Favorite"("staffId", "archiveId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybackProgress_userId_audiobookId_key" ON "PlaybackProgress"("userId", "audiobookId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybackProgress_userId_podcastId_key" ON "PlaybackProgress"("userId", "podcastId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybackProgress_userId_archiveId_key" ON "PlaybackProgress"("userId", "archiveId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybackProgress_staffId_audiobookId_key" ON "PlaybackProgress"("staffId", "audiobookId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybackProgress_staffId_podcastId_key" ON "PlaybackProgress"("staffId", "podcastId");

-- CreateIndex
CREATE UNIQUE INDEX "PlaybackProgress_staffId_archiveId_key" ON "PlaybackProgress"("staffId", "archiveId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_archiveId_key" ON "Review"("userId", "archiveId");

-- AddForeignKey
ALTER TABLE "PodcastEpisode" ADD CONSTRAINT "PodcastEpisode_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_archiveId_fkey" FOREIGN KEY ("archiveId") REFERENCES "Archive"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_podcastEpisodeId_fkey" FOREIGN KEY ("podcastEpisodeId") REFERENCES "PodcastEpisode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_archiveId_fkey" FOREIGN KEY ("archiveId") REFERENCES "Archive"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_archiveId_fkey" FOREIGN KEY ("archiveId") REFERENCES "Archive"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybackProgress" ADD CONSTRAINT "PlaybackProgress_podcastEpisodeId_fkey" FOREIGN KEY ("podcastEpisodeId") REFERENCES "PodcastEpisode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybackProgress" ADD CONSTRAINT "PlaybackProgress_archiveId_fkey" FOREIGN KEY ("archiveId") REFERENCES "Archive"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybackProgress" ADD CONSTRAINT "PlaybackProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaybackProgress" ADD CONSTRAINT "PlaybackProgress_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_podcastEpisodeId_fkey" FOREIGN KEY ("podcastEpisodeId") REFERENCES "PodcastEpisode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_archiveId_fkey" FOREIGN KEY ("archiveId") REFERENCES "Archive"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_replyTo_fkey" FOREIGN KEY ("replyTo") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_moderatedBy_fkey" FOREIGN KEY ("moderatedBy") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModerationAction" ADD CONSTRAINT "ChatModerationAction_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ChatMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatModerationAction" ADD CONSTRAINT "ChatModerationAction_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Archive" ADD CONSTRAINT "Archive_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Archive" ADD CONSTRAINT "Archive_curatedById_fkey" FOREIGN KEY ("curatedById") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Archive" ADD CONSTRAINT "Archive_podcastId_fkey" FOREIGN KEY ("podcastId") REFERENCES "Podcast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Archive" ADD CONSTRAINT "Archive_audiobookId_fkey" FOREIGN KEY ("audiobookId") REFERENCES "Audiobook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Archive" ADD CONSTRAINT "Archive_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "LiveBroadcast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Archive" ADD CONSTRAINT "Archive_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "PodcastEpisode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
