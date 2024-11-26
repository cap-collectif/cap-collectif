<?php

namespace Capco\AppBundle\Mailer\SendInBlue;

use Capco\UserBundle\Entity\User;
use Psr\Log\LoggerInterface;
use SendinBlue\Client\ApiException;
use SendinBlue\Client\Model\CreateContact;
use SendinBlue\Client\Model\GetExtendedContactDetails;
use SendinBlue\Client\Model\UpdateContact;
use Symfony\Component\HttpKernel\KernelInterface;

/**
 * call sendinblue API https://github.com/sendinblue/APIv3-php-library.
 */
class SendInBlueManager
{
    final public const SKIPPED_ENV = 'test';
    protected static ?UpdateContact $updater = null;
    protected static ?CreateContact $contactMaker = null;
    private readonly int $listId;
    private readonly KernelInterface $kernel;
    private readonly ContactsApi $apiInstance;
    private readonly LoggerInterface $logger;

    public function __construct(
        KernelInterface $kernel,
        ContactsApi $apiInstance,
        LoggerInterface $logger,
        string $sendinblueNlListId
    ) {
        $this->kernel = $kernel;
        $this->listId = (int) $sendinblueNlListId;
        $this->apiInstance = $apiInstance;
        $this->logger = $logger;
    }

    /**
     * @param array<string, mixed> $data
     *
     * @throws ApiException
     */
    public function addUserToSendInBlue(User $user, array $data = []): void
    {
        $contactMaker = $this->getContactMaker($user->getEmail());
        if ($contactMaker) {
            $contactMaker->setEmail($user->getEmail());
            $contactMaker->setListIds([$this->listId]);
            $data = array_merge(
                [
                    'firstName' => $user->getFirstname(),
                    'lastname' => $user->getLastname(),
                ],
                $data
            );
            $contactMaker->setAttributes((object) $data);
            $this->apiInstance->getSendInBlueApi()->createContact($contactMaker);
        }
    }

    /**
     * @param array<string, mixed> $data
     *
     * @throws ApiException
     */
    public function addEmailToSendInBlue(string $email, array $data = []): void
    {
        $contactMaker = $this->getContactMaker($email);
        if ($contactMaker) {
            $contactMaker->setEmail($email);
            $contactMaker->setListIds([$this->listId]);
        }
        if ($data) {
            $contactMaker->setAttributes((object) $data);
        }

        $this->apiInstance->getSendInBlueApi()->createContact($contactMaker);
    }

    /**
     * @throws ApiException
     */
    public function deleteUserFromSendInBlue(string $email): void
    {
        if (self::SKIPPED_ENV === $this->kernel->getEnvironment()) {
            return;
        }
        $contact = $this->getContact($email);
        if ($contact && \in_array($this->listId, $contact->getListIds())) {
            $this->apiInstance->getSendInBlueApi()->deleteContact($email);
        }
    }

    /** $user is a User or email.
     */
    public function blackListUser(string $email): void
    {
        try {
            $updateContact = $this->getUpdater($email);
            if ($updateContact) {
                $updateContact->setEmailBlacklisted(true);
                $this->apiInstance->getSendInBlueApi()->updateContact($email, $updateContact);
            }
        } catch (ApiException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
        }
    }

    public function getContact(string $email): ?GetExtendedContactDetails
    {
        try {
            return $this->apiInstance->getSendInBlueApi()->getContactInfo($email);
        } catch (ApiException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
        }

        return null;
    }

    public function unBlockContact(string $email): void
    {
        try {
            $updateContact = $this->getUpdater($email);
            if ($updateContact) {
                $updateContact->setEmailBlacklisted(false);
                $this->apiInstance->getSendInBlueApi()->updateContact($email, $updateContact);
            }
        } catch (ApiException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
        }
    }

    private function contactIsBlocked(string $email): bool
    {
        try {
            $contact = $this->getContact($email);

            return $contact && $contact->getEmailBlacklisted();
        } catch (ApiException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            return false;
        }
    }

    private function getUpdater($email): ?UpdateContact
    {
        if (self::SKIPPED_ENV === $this->kernel->getEnvironment()) {
            return null;
        }

        $contact = $this->getContact($email);
        if ($contact && \in_array($this->listId, $contact->getListIds())) {
            if (null === static::$updater) {
                static::$updater = new UpdateContact();
            }
        }

        return static::$updater;
    }

    private function getContactMaker($email): ?CreateContact
    {
        if (self::SKIPPED_ENV === $this->kernel->getEnvironment()) {
            return null;
        }
        if ($this->contactIsBlocked($email)) {
            $this->unBlockContact($email);

            return null;
        }
        if (null === static::$contactMaker) {
            static::$contactMaker = new CreateContact();
        }

        return static::$contactMaker;
    }
}
