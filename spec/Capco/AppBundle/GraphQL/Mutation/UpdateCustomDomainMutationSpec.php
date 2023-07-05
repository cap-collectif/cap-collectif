<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Client\DeployerClient;
use Capco\AppBundle\Entity\SiteSettings;
use Capco\AppBundle\Enum\SiteSettingsStatus;
use Capco\AppBundle\GraphQL\Mutation\UpdateCustomDomainMutation;
use Capco\AppBundle\Repository\SiteSettingsRepository;
use Capco\AppBundle\Validator\Constraints\CheckCustomDomainConstraint;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\ConstraintViolationInterface;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateCustomDomainMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        SiteSettingsRepository $siteSettingsRepository,
        LoggerInterface $logger,
        DeployerClient $deployerClient,
        ValidatorInterface $validator
    ) {
        $this->beConstructedWith(
            $em,
            $siteSettingsRepository,
            $logger,
            $deployerClient,
            $validator,
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateCustomDomainMutation::class);
    }

    public function it_should_set_idle_status_if_custom_domain_is_empty(
        SiteSettingsRepository $siteSettingsRepository,
        Arg $input,
        User $user,
        SiteSettings $siteSettings,
        EntityManagerInterface $em
    ) {
        $customDomain = '';
        $input
            ->offsetGet('customDomain')
            ->shouldBeCalledOnce()
            ->willReturn($customDomain)
        ;
        $siteSettingsRepository
            ->findSiteSetting()
            ->shouldBeCalledOnce()
            ->willReturn($siteSettings)
        ;
        $siteSettings->setCustomDomain($customDomain)->shouldBeCalledOnce();

        $siteSettings->setStatus(SiteSettingsStatus::IDLE)->shouldBeCalledOnce();
        $em->persist(Argument::type(SiteSettings::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $payload = $this->__invoke($input, $user);
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe(null);
        $payload['siteSettings']->shouldHaveType(SiteSettings::class);
    }

    public function it_should_return_custom_domain_styntax_not_valid_error_code_if_custom_domain_syntax_is_not_valid(
        SiteSettingsRepository $siteSettingsRepository,
        Arg $input,
        User $user,
        SiteSettings $siteSettings,
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        ConstraintViolationInterface $violation
    ) {
        $customDomain = 'abc';
        $input
            ->offsetGet('customDomain')
            ->shouldBeCalledOnce()
            ->willReturn($customDomain)
        ;
        $siteSettingsRepository
            ->findSiteSetting()
            ->shouldBeCalledOnce()
            ->willReturn($siteSettings)
        ;
        $siteSettings->setCustomDomain($customDomain)->shouldBeCalledOnce();

        $siteSettings->setStatus(SiteSettingsStatus::IDLE)->shouldNotBeCalled();
        $em->persist(Argument::type(SiteSettings::class))->shouldNotBeCalled();
        $em->flush()->shouldNotBeCalled();

        $violations = new ConstraintViolationList([$violation->getWrappedObject()]);
        $validator
            ->validate($customDomain, Argument::type(CheckCustomDomainConstraint::class))
            ->shouldBeCalledOnce()
            ->willReturn($violations)
        ;
        $violation
            ->getMessage()
            ->shouldBeCalledOnce()
            ->willReturn(UpdateCustomDomainMutation::CUSTOM_DOMAIN_SYNTAX_NOT_VALID)
        ;

        $payload = $this->__invoke($input, $user);
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe(UpdateCustomDomainMutation::CUSTOM_DOMAIN_SYNTAX_NOT_VALID);
        $payload['siteSettings']->shouldHaveType(SiteSettings::class);
    }

    public function it_should_set_status_to_pending_if_cname_is_not_valid(
        SiteSettingsRepository $siteSettingsRepository,
        Arg $input,
        User $user,
        SiteSettings $siteSettings,
        ValidatorInterface $validator,
        ConstraintViolationInterface $violation
    ) {
        $customDomain = 'domain.com';
        $input
            ->offsetGet('customDomain')
            ->shouldBeCalledOnce()
            ->willReturn($customDomain)
        ;
        $siteSettingsRepository
            ->findSiteSetting()
            ->shouldBeCalledOnce()
            ->willReturn($siteSettings)
        ;
        $siteSettings->setCustomDomain($customDomain)->shouldBeCalledOnce();

        $violations = new ConstraintViolationList([$violation->getWrappedObject()]);
        $validator
            ->validate($customDomain, Argument::type(CheckCustomDomainConstraint::class))
            ->shouldBeCalledOnce()
            ->willReturn($violations)
        ;
        $violation
            ->getMessage()
            ->shouldBeCalledOnce()
            ->willReturn(UpdateCustomDomainMutation::CNAME_NOT_VALID)
        ;

        $payload = $this->__invoke($input, $user);
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe(UpdateCustomDomainMutation::CNAME_NOT_VALID);
        $payload['siteSettings']->shouldHaveType(SiteSettings::class);
    }

    public function it_should_return_error_deployer_api_if_deployer_does_not_return_201(
        SiteSettingsRepository $siteSettingsRepository,
        Arg $input,
        User $user,
        SiteSettings $siteSettings,
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        DeployerClient $deployerClient
    ) {
        $customDomain = 'domain.com';
        $input
            ->offsetGet('customDomain')
            ->shouldBeCalledOnce()
            ->willReturn($customDomain)
        ;
        $siteSettingsRepository
            ->findSiteSetting()
            ->shouldBeCalledOnce()
            ->willReturn($siteSettings)
        ;
        $siteSettings->setCustomDomain($customDomain)->shouldBeCalledOnce();

        $violations = new ConstraintViolationList([]);
        $validator
            ->validate($customDomain, Argument::type(CheckCustomDomainConstraint::class))
            ->shouldBeCalledOnce()
            ->willReturn($violations)
        ;

        $deployerClient->updateCurrentDomain($customDomain)->willReturn(400);
        $em->persist(Argument::type(SiteSettings::class))->shouldNotBeCalled();
        $em->flush()->shouldNotBeCalled();

        $payload = $this->__invoke($input, $user);
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe(UpdateCustomDomainMutation::ERROR_DEPLOYER_API);
        $payload['siteSettings']->shouldHaveType(SiteSettings::class);
    }

    public function it_should_set_active_status_if_deployer_does_return_201(
        SiteSettingsRepository $siteSettingsRepository,
        Arg $input,
        User $user,
        SiteSettings $siteSettings,
        EntityManagerInterface $em,
        ValidatorInterface $validator,
        DeployerClient $deployerClient
    ) {
        $customDomain = 'domain.com';
        $input
            ->offsetGet('customDomain')
            ->shouldBeCalledOnce()
            ->willReturn($customDomain)
        ;
        $siteSettingsRepository
            ->findSiteSetting()
            ->shouldBeCalledOnce()
            ->willReturn($siteSettings)
        ;
        $siteSettings->setCustomDomain($customDomain)->shouldBeCalledOnce();

        $violations = new ConstraintViolationList([]);
        $validator
            ->validate($customDomain, Argument::type(CheckCustomDomainConstraint::class))
            ->shouldBeCalledOnce()
            ->willReturn($violations)
        ;

        $deployerClient
            ->updateCurrentDomain($customDomain)
            ->shouldBeCalledOnce()
            ->willReturn(201)
        ;
        $siteSettings->setStatus(SiteSettingsStatus::ACTIVE)->shouldBeCalledOnce();
        $em->persist(Argument::type(SiteSettings::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $payload = $this->__invoke($input, $user);
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe(null);
        $payload['siteSettings']->shouldHaveType(SiteSettings::class);
    }
}
