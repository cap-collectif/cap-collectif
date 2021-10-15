<?php

namespace spec\Capco\AppBundle\Command;

use Capco\AppBundle\Command\GenerateIdentificationCodeCommand;
use Capco\AppBundle\Entity\UserIdentificationCode;
use Capco\AppBundle\Repository\UserIdentificationCodeRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\EntityManagerInterface;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

class GenerateIdentificationCodeCommandSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        UserIdentificationCodeRepository $userIdentificationCodeRepository
    ) {
        $this->beConstructedWith($em, 'public/export', $logger, $userIdentificationCodeRepository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(GenerateIdentificationCodeCommand::class);
    }

    public function it_check_if_code_exist_in_bdd(
        UserIdentificationCode $newUserIdentificationCode,
        ArrayCollection $newUserIdentificationCodes
    ) {
        $uniqId = '61646F4F10DAD';
        $existingCodes = [];
        $newUserIdentificationCode->getIdentificationCode()->willReturn($uniqId);

        $this->checkIfExistInBdd($newUserIdentificationCode, $existingCodes)->shouldReturn(
            $newUserIdentificationCode
        );
    }

    public function it_check_if_code_exist_in_bdd_with_existing_code(
        UserIdentificationCode $newUserIdentificationCode,
        ArrayCollection $newUserIdentificationCodes,
        UserIdentificationCode $existingCode
    ) {
        $existingUniqId = '61646F4F10DAB';
        $uniqId = '61646F4F10DAD';
        $existingCodes = [$existingUniqId];
        $existingCode->getIdentificationCode()->willReturn($existingUniqId);
        $newUserIdentificationCode->getIdentificationCode()->willReturn($uniqId);

        $this->checkIfExistInBdd($newUserIdentificationCode, $existingCodes)->shouldNotReturn(
            $existingCode
        );
        $this->checkIfExistInBdd($newUserIdentificationCode, $existingCodes)->shouldReturn(
            $newUserIdentificationCode
        );
    }

    public function it_check_if_exiting_code_in_generated_values(
        UserIdentificationCode $userIdentificationCode,
        UserIdentificationCode $newUserIdentificationCode,
        ArrayCollection $newUserIdentificationCodes
    ) {
        $uniqId = '61646F4F10DAD';
        $uniqId1 = '61646F4F10DAB';
        $newUserIdentificationCode->getIdentificationCode()->willReturn($uniqId);
        $userIdentificationCode->getIdentificationCode()->willReturn($uniqId1);

        $newUserIdentificationCodes->add($userIdentificationCode);
        $this->checkIfExistingInGenerated(
            $newUserIdentificationCode,
            $newUserIdentificationCodes
        )->shouldReturn($newUserIdentificationCode);
    }

    public function it_check_if_exiting_code_in_generated_values_with_exiting_values(
        UserIdentificationCode $userIdentificationCode1,
        UserIdentificationCode $userIdentificationCode2,
        UserIdentificationCode $newUserIdentificationCode,
        UserIdentificationCode $badUserIdentificationCode,
        ArrayCollection $newUserIdentificationCodes
    ) {
        $existingUniqId = '61646F4F10DAD';
        $uniqId = '61646F4F10DAC';
        $badUniqId = '61646F4F10DAD';
        $newUniqId = '61646F4F10DAF';
        $badUserIdentificationCode->getIdentificationCode()->willReturn($badUniqId);
        $userIdentificationCode2->getIdentificationCode()->willReturn($existingUniqId);
        $userIdentificationCode1->getIdentificationCode()->willReturn($uniqId);
        $newUserIdentificationCode->getIdentificationCode()->willReturn($newUniqId);

        $newUserIdentificationCodes->add($userIdentificationCode1);

        $this->checkIfExistingInGenerated(
            $newUserIdentificationCode,
            $newUserIdentificationCodes
        )->shouldNotReturn($badUserIdentificationCode);
        $this->checkIfExistingInGenerated(
            $newUserIdentificationCode,
            $newUserIdentificationCodes
        )->shouldReturn($newUserIdentificationCode);
    }
}
