<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\GraphQL\Mutation\Sms\UpdateTwilioVerifyServiceMutation;
use Capco\AppBundle\Helper\TwilioClient;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;

class UpdateTwilioVerifyServiceMutationSpec extends ObjectBehavior
{
    public function let(
        TwilioClient $twilioClient,
        EntityManagerInterface $em,
        ExternalServiceConfigurationRepository $externalServiceConfigurationRepository
    ) {
        $this->beConstructedWith($twilioClient, $em, $externalServiceConfigurationRepository);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateTwilioVerifyServiceMutation::class);
    }

    public function it_should_update_verify_service(
        Arg $input,
        TwilioClient $twilioClient,
        EntityManagerInterface $em,
        ExternalServiceConfigurationRepository $externalServiceConfigurationRepository,
        ExternalServiceConfiguration $externalServiceConfiguration
    ) {
        $serviceName = 'udpatedServiceName';
        $input->offsetGet('serviceName')->willReturn($serviceName);

        $response = ['statusCode' => 200, 'data' => ['friendly_name' => 'udpatedServiceName']];

        $twilioClient->updateVerifyService($serviceName)->willReturn($response);

        $externalServiceConfigurationRepository
            ->findOneBy([
                'type' => 'twilio_verify_service_name',
            ])
            ->shouldBeCalledOnce()
            ->willReturn($externalServiceConfiguration)
        ;

        $externalServiceConfiguration->setValue('udpatedServiceName')->shouldBeCalledOnce();

        $em->flush()->shouldBeCalledOnce();

        $this->__invoke($input)->shouldBe([
            'serviceName' => 'udpatedServiceName',
            'errorCode' => null,
        ]);
    }

    public function it_should_return_twilio_api_error_if_response_is_not_201(
        Arg $input,
        TwilioClient $twilioClient,
        EntityManagerInterface $em,
        ExternalServiceConfigurationRepository $externalServiceConfigurationRepository,
        ExternalServiceConfiguration $externalServiceConfiguration
    ) {
        $serviceName = 'udpatedServiceName';
        $input->offsetGet('serviceName')->willReturn($serviceName);

        $response = ['statusCode' => 400, 'data' => []];

        $twilioClient->updateVerifyService($serviceName)->willReturn($response);

        $this->__invoke($input)->shouldBe([
            'errorCode' => 'TWILIO_API_ERROR',
        ]);
    }
}
