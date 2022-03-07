<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Client\DeployerClient;
use Capco\AppBundle\Entity\SiteSettings;
use Capco\AppBundle\Enum\SiteSettingsStatus;
use Capco\AppBundle\GraphQL\Mutation\DeleteCustomDomainMutation;
use Capco\AppBundle\Repository\SiteSettingsRepository;
use PhpSpec\ObjectBehavior;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;

class DeleteCustomDomainMutationSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $em,
        SiteSettingsRepository $siteSettingsRepository,
        DeployerClient $deployerClient
    ) {
        $this->beConstructedWith($em, $siteSettingsRepository, $deployerClient);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(DeleteCustomDomainMutation::class);
    }

    public function it_should_return_error_deployer_api_error_code_if_api_call_fails(
        SiteSettingsRepository $siteSettingsRepository,
        Arg $input,
        SiteSettings $siteSettings,
        EntityManagerInterface $em,
        DeployerClient $deployerClient
    ) {
        $capcoDomain = 'domain.capco.com';
        $siteSettingsRepository
            ->findSiteSetting()
            ->shouldBeCalledOnce()
            ->willReturn($siteSettings);
        $siteSettings
            ->getCapcoDomain()
            ->shouldBeCalledOnce()
            ->willReturn($capcoDomain);

        $statusCode = '400';
        $deployerClient->updateCurrentDomain($capcoDomain)->willReturn($statusCode);

        $siteSettings->setCustomDomain(null)->shouldNotBeCalled();
        $siteSettings->setStatus(SiteSettingsStatus::IDLE)->shouldNotBeCalled();
        $em->flush()->shouldNotBeCalled();

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe(DeleteCustomDomainMutation::ERROR_DEPLOYER_API);
        $payload['siteSettings']->shouldHaveType(SiteSettings::class);
    }

    public function it_should_set_idle_status_if_api_call_is_successful(
        SiteSettingsRepository $siteSettingsRepository,
        Arg $input,
        SiteSettings $siteSettings,
        EntityManagerInterface $em,
        DeployerClient $deployerClient
    ) {
        $capcoDomain = 'domain.capco.com';
        $siteSettingsRepository
            ->findSiteSetting()
            ->shouldBeCalledOnce()
            ->willReturn($siteSettings);
        $siteSettings
            ->getCapcoDomain()
            ->shouldBeCalledOnce()
            ->willReturn($capcoDomain);

        $statusCode = '201';
        $deployerClient->updateCurrentDomain($capcoDomain)->willReturn($statusCode);

        $siteSettings->setCustomDomain(null)->shouldBeCalledOnce();
        $siteSettings->setStatus(SiteSettingsStatus::IDLE)->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $payload = $this->__invoke($input);
        $payload->shouldHaveCount(2);
        $payload['errorCode']->shouldBe(null);
        $payload['siteSettings']->shouldHaveType(SiteSettings::class);
    }
}
