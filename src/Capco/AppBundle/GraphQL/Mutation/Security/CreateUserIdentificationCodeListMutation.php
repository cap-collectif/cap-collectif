<?php

namespace Capco\AppBundle\GraphQL\Mutation\Security;

use Capco\AppBundle\Entity\Security\UserIdentificationCode;
use Capco\AppBundle\Entity\Security\UserIdentificationCodeList;
use Capco\AppBundle\Generator\IdentificationCodeGenerator;
use Capco\AppBundle\Repository\Security\UserIdentificationCodeRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CreateUserIdentificationCodeListMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private UserIdentificationCodeRepository $codeRepository;

    public function __construct(
        EntityManagerInterface $em,
        UserIdentificationCodeRepository $codeRepository
    ) {
        $this->em = $em;
        $this->codeRepository = $codeRepository;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $list = $this->generateListAndCodes(
            $input->offsetGet('name'),
            $viewer,
            $input->offsetGet('data')
        );
        $this->em->persist($list);
        $this->em->flush();

        return ['userIdentificationCodeList' => $list];
    }

    private function generateListAndCodes(
        string $name,
        User $owner,
        array $csvData
    ): UserIdentificationCodeList {
        $list = self::generateList($name, $owner);
        $this->generateUserIdentificationCodesForList($list, $csvData);

        return $list;
    }

    private function generateUserIdentificationCodesForList(
        UserIdentificationCodeList $list,
        array $csvData
    ): void {
        $this->addCodesToCsvData($csvData);
        foreach ($csvData as $csvDatum) {
            $userIdentificationCode = self::generateUserIdentificationCodeFromDatum($csvDatum);
            $userIdentificationCode->setList($list);
            $list->getCodes()->add($userIdentificationCode);
        }
    }

    private function addCodesToCsvData(array &$csvData): void
    {
        $newCodes = $this->generatePlainCodes(\count($csvData));
        foreach ($csvData as $i => $csvDatum) {
            $csvData[$i]['code'] = $newCodes[$i];
        }
    }

    private function generatePlainCodes(int $nb): array
    {
        return IdentificationCodeGenerator::generateArrayOfCodes(
            $nb,
            null,
            $this->codeRepository->getPlainCodes()
        );
    }

    private static function generateList(string $name, User $owner): UserIdentificationCodeList
    {
        $list = new UserIdentificationCodeList();
        $list->setName($name);
        $list->setOwner($owner);

        return $list;
    }

    private static function generateUserIdentificationCodeFromDatum(
        array $csvDatum
    ): UserIdentificationCode {
        $userIdentificationCode = new UserIdentificationCode();
        $userIdentificationCode->setIdentificationCode($csvDatum['code']);
        $userIdentificationCode->hydrate($csvDatum);

        return $userIdentificationCode;
    }
}
