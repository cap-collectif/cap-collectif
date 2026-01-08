<?php

declare(strict_types=1);

namespace Capco\AppBundle\Antivirus;

use Capco\AppBundle\Toggle\Manager;
use Psr\Log\LoggerInterface;

class AntivirusScanner
{
    private const CLAMD_SOCKET_PATH = '/var/run/clamav/clamd.sock';
    private const LAST_SCAN_DATE_PATH = '/var/www/public/media/clamav-logs/last_scan_date.txt';
    private const SOCKET_TIMEOUT = 30;
    private const CHUNK_SIZE = 8192;

    public function __construct(
        private readonly LoggerInterface $logger,
        private readonly Manager $toggleManager
    ) {
    }

    /**
     * Scan a file for viruses using clamd.
     *
     * @return ScanResult The result of the scan
     */
    public function scan(string $filePath): ScanResult
    {
        if (!$this->toggleManager->isActive(Manager::antivirus)) {
            $this->logger->info('AntivirusScanner: Feature disabled, skipping scan', ['filePath' => $filePath]);

            return ScanResult::clean();
        }

        if (!file_exists($filePath)) {
            $this->logger->error('AntivirusScanner: File does not exist', ['filePath' => $filePath]);

            return ScanResult::error('File does not exist');
        }

        $socket = $this->connectToClamd();
        if (null === $socket) {
            $this->logger->warning('AntivirusScanner: clamd unavailable, skipping scan', ['filePath' => $filePath]);

            return ScanResult::unavailable();
        }

        try {
            $result = $this->performScan($socket, $filePath);

            if ($result->isClean()) {
                $this->touchLastScanDate();
            }

            return $result;
        } finally {
            fclose($socket);
        }
    }

    public function scanAndDeleteIfInfected(string $filePath): ScanResult
    {
        $result = $this->scan($filePath);

        if ($result->isInfected()) {
            $this->deleteFile($filePath);
            $this->logger->warning('AntivirusScanner: Infected file deleted', [
                'filePath' => $filePath,
                'virusName' => $result->getVirusName(),
            ]);
        }

        return $result;
    }

    /**
     * @return null|resource
     */
    private function connectToClamd()
    {
        $socketPath = 'unix://' . self::CLAMD_SOCKET_PATH;

        $socket = @fsockopen($socketPath, -1, $errno, $errstr, self::SOCKET_TIMEOUT);

        if (false === $socket) {
            $this->logger->warning('AntivirusScanner: Failed to connect to clamd', [
                'socketPath' => self::CLAMD_SOCKET_PATH,
                'errno' => $errno,
                'errstr' => $errstr,
            ]);

            return null;
        }

        stream_set_timeout($socket, self::SOCKET_TIMEOUT);

        return $socket;
    }

    /**
     * Perform scan using INSTREAM protocol.
     * This streams file content to clamd instead of asking clamd to read from disk,
     * avoiding permission issues with temp files.
     *
     * @param resource $socket
     */
    private function performScan($socket, string $filePath): ScanResult
    {
        $fileHandle = @fopen($filePath, 'r');
        if (false === $fileHandle) {
            $this->logger->error('AntivirusScanner: Cannot open file for reading', ['filePath' => $filePath]);

            return ScanResult::error('Cannot open file for reading');
        }

        try {
            // Send INSTREAM command
            if (false === fwrite($socket, "nINSTREAM\n")) {
                return ScanResult::error('Failed to send INSTREAM command');
            }

            // Stream file content in chunks
            while (!feof($fileHandle)) {
                $chunk = fread($fileHandle, self::CHUNK_SIZE);
                if (false === $chunk) {
                    return ScanResult::error('Failed to read file chunk');
                }

                $chunkLen = \strlen($chunk);
                if ($chunkLen > 0) {
                    // Send 4-byte length prefix (big-endian) followed by chunk data
                    $lengthPrefix = pack('N', $chunkLen);
                    if (false === fwrite($socket, $lengthPrefix . $chunk)) {
                        return ScanResult::error('Failed to send chunk to clamd');
                    }
                }
            }

            // Send zero-length chunk to signal end of stream
            if (false === fwrite($socket, pack('N', 0))) {
                return ScanResult::error('Failed to send end-of-stream marker');
            }

            $response = fgets($socket);

            if (false === $response || '' === $response) {
                $this->logger->error('AntivirusScanner: No response from clamd', ['filePath' => $filePath]);

                return ScanResult::error('No response from clamd');
            }

            return $this->parseResponse($response, $filePath);
        } finally {
            fclose($fileHandle);
        }
    }

    private function parseResponse(string $response, string $filePath): ScanResult
    {
        $response = trim($response);

        // INSTREAM response format: "stream: OK" or "stream: VirusName FOUND"
        // nSCAN response format: "/path/to/file: OK" or "/path/to/file: VirusName FOUND"
        if (str_ends_with($response, ': OK')) {
            $this->logger->info('AntivirusScanner: File is clean', ['filePath' => $filePath]);

            return ScanResult::clean();
        }

        if (str_contains($response, ' FOUND')) {
            // Extract virus name: "stream: VirusName FOUND" or "/path/to/file: VirusName FOUND"
            $pattern = '/: (.+) FOUND$/';
            if (preg_match($pattern, $response, $matches)) {
                $virusName = $matches[1];
                $this->logger->error('AntivirusScanner: Virus detected', [
                    'filePath' => $filePath,
                    'virusName' => $virusName,
                ]);

                return ScanResult::infected($virusName);
            }

            return ScanResult::infected('Unknown');
        }

        if (str_contains($response, ' ERROR') || str_contains($response, 'INSTREAM size limit exceeded')) {
            $this->logger->error('AntivirusScanner: Scan error', [
                'filePath' => $filePath,
                'response' => $response,
            ]);

            return ScanResult::error($response);
        }

        $this->logger->error('AntivirusScanner: Unknown response', [
            'filePath' => $filePath,
            'response' => $response,
        ]);

        return ScanResult::error('Unknown response: ' . $response);
    }

    private function deleteFile(string $filePath): void
    {
        if (file_exists($filePath)) {
            if (!unlink($filePath)) {
                $this->logger->error('AntivirusScanner: Failed to delete infected file', ['filePath' => $filePath]);
            }
        }
    }

    private function touchLastScanDate(): void
    {
        $dir = \dirname(self::LAST_SCAN_DATE_PATH);
        if (!is_dir($dir)) {
            return;
        }

        touch(self::LAST_SCAN_DATE_PATH);
    }
}
