<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Firebase\JWT\JWT;
use Capco\AppBundle\Entity\Event;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class GenerateJitsiRoomMutation implements MutationInterface
{
    use ResolverTrait;
    private EntityManagerInterface $entityManager;
    private GlobalIdResolver $globalIdResolver;

    private string $baseUrl;
    private string $jwtKey;
    private string $jitsiEncryptionKey;
    private string $jitsiHexIv;

    public function __construct(
        EntityManagerInterface $entityManager,
        GlobalIdResolver $globalIdResolver,
        string $baseUrl,
        string $jwtKey,
        string $jitsiEncryptionKey,
        string $jitsiHexIv
    ) {
        $this->entityManager = $entityManager;
        $this->globalIdResolver = $globalIdResolver;
        $this->baseUrl = $baseUrl;
        $this->jwtKey = $jwtKey;
        $this->jitsiEncryptionKey = $jitsiEncryptionKey;
        $this->jitsiHexIv = $jitsiHexIv;
    }

    public function __invoke(Arg $input, $viewer): array
    {
        $this->preventNullableViewer($viewer);

        $event = $this->globalIdResolver->resolve($input->offsetGet('eventId'), $viewer);
        if (!$event) {
            throw new UserError('Could not find this event.');
        }
        $this->createJitsiRoomForEvent($event);

        return [
            'roomName' => $event->getRoomName(),
            'jitsiToken' => $event->getJitsiToken(),
        ];
    }

    public function createJitsiRoomForEvent(Event $event): void
    {
        $roomName = bin2hex(random_bytes(32));
        $encodedRoomName = $this->encodeRoomName($roomName);
        $payload = [
            'context' => [
                'user' => [
                    // TODO find another link
                    'avatar' =>
                        'https://www.democratieouverte.org/wp-content/uploads/2015/06/Capco_logo.png',
                    'name' => 'CapCo Private User',
                    'email' => '***REMOVED***',
                ],
            ],
            'aud' => '***REMOVED***',
            'iss' => '***REMOVED***',
            'sub' => 'meet.jitsi',
            'room' => $roomName,
        ];

        $token = JWT::encode($payload, $this->jwtKey, 'HS256');
        $event->setRoomName($roomName);
        $event->setJitsiToken($token);

        $baseUrl = $this->baseUrl;
        // A litter hack for our MacOS dev env.
        if ('https://capco.dev' === $baseUrl) {
            $baseUrl = 'https://assets.cap.co';
        }

        $event->setRecordingLink($baseUrl . "/jitsi_recordings/${encodedRoomName}");

        // TODO do not call flush here
        $this->entityManager->flush();
    }

    /**
     * This will guess the name of the file on the S3 bucket.
     *
     * /!\ You will probably break existing tokens if you update this. /!\
     *
     * TODO unit test this.
     */
    private function encodeRoomName(string $roomName): string
    {
        $cipher = 'aes-256-cfb';
        $iv = hex2bin($this->jitsiHexIv);
        if (\in_array($cipher, openssl_get_cipher_methods(), true)) {
            $ciphertext_raw = openssl_encrypt(
                $roomName,
                $cipher,
                $this->jitsiEncryptionKey,
                $options = 0,
                $iv
            );
            // Can't have dashes in the name of the file
            return str_replace('/', '-', $ciphertext_raw) . '.mp4';
        }

        return $roomName;
    }
}
