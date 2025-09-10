<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Helper\ConvertCsvToArray;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\UserType;
use Capco\UserBundle\Repository\UserTypeRepository;

class CreateIDFUsersFromCsvCommand extends CreateUsersFromCsvCommand
{
    final public const HEADER_OPENID = 'openid_id';
    final public const HEADER_USER_TYPE = 'user_type';
    protected array $createdOpenIds = [];
    protected array $userTypes = [];

    public function __construct(
        ?string $name,
        UserManager $userManager,
        ConvertCsvToArray $csvReader,
        private readonly UserTypeRepository $userTypeRepository
    ) {
        parent::__construct($name, $userManager, $csvReader);
    }

    protected function getRowErrors(array &$row): array
    {
        $errors = [];
        $this->checkEmail($errors, $row[self::HEADER_EMAIL]);

        if (empty($row[self::HEADER_OPENID])) {
            $errors[] = 'missing openId id';
        } elseif ($this->isOpenIdAlreadyUsed($row[self::HEADER_OPENID])) {
            $errors[] = 'opendId id ' . $row[self::HEADER_OPENID] . ' is already used';
        }

        if (isset($row[self::HEADER_USER_TYPE])) {
            $userType = trim((string) $row[self::HEADER_USER_TYPE]);
            if ($userType && !\in_array($userType, $this->getUserTypes())) {
                $errors[] = "userType {$userType} not found.";
            }
        }

        return $errors;
    }

    protected function importRow(array $row): void
    {
        $user = $this->generateUser(trim((string) $row[self::HEADER_USERNAME]), $row[self::HEADER_EMAIL]);
        $user->setOpenId($row[self::HEADER_OPENID]);
        if (isset($row[self::HEADER_USER_TYPE]) && !empty($row[self::HEADER_USER_TYPE])) {
            $user->setUserType($this->getUserTypes()[trim((string) $row[self::HEADER_USER_TYPE])]);
        }
        $this->createdOpenIds[] = $user->getOpenId();

        if (!$this->dryRun) {
            $this->userManager->updateUser($user);
        }
    }

    private function isOpenIdAlreadyUsed(string $openId): bool
    {
        if (\array_key_exists($openId, $this->createdOpenIds)) {
            return true;
        }
        if ($this->userManager->findUserBy(['openId' => $openId])) {
            return true;
        }

        return false;
    }

    /**
     * @return UserType[]
     */
    private function getUserTypes(): array
    {
        if (empty($this->userTypes)) {
            foreach ($this->userTypeRepository->findAll() as $userType) {
                $this->userTypes[trim($userType->getName() ?? '')] = $userType;
            }
        }

        return $this->userTypes;
    }
}
