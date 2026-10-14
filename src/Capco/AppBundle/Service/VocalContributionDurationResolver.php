<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Exception\VocalContributionUploadException;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

final class VocalContributionDurationResolver
{
    public function getDuration(UploadedFile $file): ?float
    {
        $lines = $this->probe($file, ['-show_entries', 'stream=codec_type:format=duration']);
        if (null === $lines) {
            return null;
        }

        $duration = null;
        $hasAudioStream = false;
        foreach ($lines as $line) {
            if ('audio' === $line) {
                $hasAudioStream = true;
            } elseif ('video' === $line) {
                // Browsers record audio-only files: a video stream is never expected
                throw new VocalContributionUploadException('INVALID_VOICE_MESSAGE', Response::HTTP_UNPROCESSABLE_ENTITY);
            } elseif (is_numeric($line)) {
                $duration = (float) $line;
            }
        }

        if (!$hasAudioStream) {
            throw new VocalContributionUploadException('INVALID_VOICE_MESSAGE', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // A WebM recorded by MediaRecorder has no duration in its header ("N/A"): use the end of the last audio packet
        if (null === $duration) {
            $packets = $this->probe($file, ['-select_streams', 'a:0', '-show_entries', 'packet=pts_time,duration_time']);
            if (null === $packets) {
                return null;
            }
            $duration = $this->getLastAudioPacketEnd($packets);
        }

        if (null === $duration) {
            throw new VocalContributionUploadException('INVALID_VOICE_MESSAGE', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return $duration;
    }

    /**
     * @param string[] $packets
     */
    private function getLastAudioPacketEnd(array $packets): ?float
    {
        $end = null;
        foreach ($packets as $line) {
            [$pts, $duration] = array_pad(explode('|', $line), 2, '');
            if (is_numeric($pts)) {
                $end = max($end ?? 0.0, (float) $pts + (is_numeric($duration) ? (float) $duration : 0.0));
            }
        }

        return $end;
    }

    /**
     * @param string[] $arguments
     *
     * @return null|string[] the non-empty output lines, or null when probing timed out
     */
    private function probe(UploadedFile $file, array $arguments): ?array
    {
        $process = new Process([
            'ffprobe',
            '-v',
            'error',
            ...$arguments,
            '-of',
            'compact=p=0:nk=1',
            $file->getPathname(),
        ]);
        $process->setTimeout(3);

        try {
            $process->run();
        } catch (ProcessTimedOutException) {
            // Accept the upload after trusted file validation when probing exceeds the request budget.
            return null;
        } catch (\Throwable) {
            throw new VocalContributionUploadException('INVALID_VOICE_MESSAGE', Response::HTTP_BAD_REQUEST);
        }

        if (!$process->isSuccessful()) {
            throw new VocalContributionUploadException('INVALID_VOICE_MESSAGE', Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return array_values(array_filter(array_map('trim', preg_split('/\R/', trim($process->getOutput())) ?: [])));
    }
}
