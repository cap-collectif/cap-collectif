<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\FileSystem\ConfigFileSystem;

class Encryptor
{
    public const CIPHERING = 'AES-256-CBC';
    public const TOKEN_CONFIG_FOLDER = '/jwt';
    private readonly string $privateKey;

    public function __construct(private readonly ConfigFileSystem $filesystem)
    {
        $this->privateKey = $this->filesystem->get(self::TOKEN_CONFIG_FOLDER . '/private.pem')->getContent();
    }

    public function encryptData(string $data): string
    {
        $ivLen = openssl_cipher_iv_length(self::CIPHERING);
        if (!$ivLen) {
            return '';
        }
        $iv = openssl_random_pseudo_bytes($ivLen);
        if (!$iv) {
            return '';
        }
        $ciphertext_raw = openssl_encrypt($data, self::CIPHERING, $this->privateKey, \OPENSSL_RAW_DATA, $iv);
        if (!$ciphertext_raw) {
            return '';
        }
        $hmac = hash_hmac('sha256', $ciphertext_raw, $this->privateKey, true);
        if (!$hmac) {
            return '';
        }

        return base64_encode($iv . $hmac . $ciphertext_raw);
    }

    public function decryptData(string $encodedData): string
    {
        $c = base64_decode($encodedData);
        $ivLen = openssl_cipher_iv_length(self::CIPHERING);
        if (!$ivLen) {
            return '';
        }
        $iv = substr($c, 0, $ivLen);
        $hmac = substr($c, $ivLen, $sha2len = 32);
        $ciphertext_raw = substr($c, $ivLen + $sha2len);

        $decryptedData = openssl_decrypt($ciphertext_raw, self::CIPHERING, $this->privateKey, $options = \OPENSSL_RAW_DATA, $iv);

        return $decryptedData ?: '';
    }
}
