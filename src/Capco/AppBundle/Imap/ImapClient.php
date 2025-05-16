<?php

namespace Capco\AppBundle\Imap;

use Capco\AppBundle\Imap\Exception\AuthenticationFailedException;
use Capco\AppBundle\Imap\Exception\ConnectionToServerFailedException;
use Capco\AppBundle\Imap\Exception\FolderNotFoundException;
use Webklex\PHPIMAP\Client;
use Webklex\PHPIMAP\ClientManager;
use Webklex\PHPIMAP\Exceptions\AuthFailedException;
use Webklex\PHPIMAP\Exceptions\ConnectionFailedException;
use Webklex\PHPIMAP\Exceptions\ImapBadRequestException;
use Webklex\PHPIMAP\Exceptions\ImapServerErrorException;

class ImapClient
{
    public function __construct(
        private readonly string $serverUrl,
        private readonly string $login,
        private readonly string $password,
        private readonly int $port = 993,
    ) {
    }

    public function getClient(): Client
    {
        $cm = new ClientManager();

        return $cm->make([
            'host' => $this->serverUrl,
            'port' => $this->port,
            'encryption' => 'ssl',
            'validate_cert' => true,
            'username' => $this->login,
            'password' => $this->password,
            'protocol' => 'imap',
        ]);
    }

    public function testConnection(string $folderPath = 'INBOX'): void
    {
        $client = $this->getClient();

        try {
            $client->connect();
        } catch (AuthFailedException|ImapBadRequestException|ImapServerErrorException) {
            throw new AuthenticationFailedException('Authentication Failed');
        } catch (ConnectionFailedException) {
            throw new ConnectionToServerFailedException('Connection Failed to the server');
        }

        $folder = $client->getFolderByPath($folderPath);

        if (!$folder) {
            throw new FolderNotFoundException('Folder not found: ' . $folderPath);
        }
    }
}
