<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\GraphQL\Mutation\Sms\CreateTwilioVerifyServiceMutation;
use Capco\AppBundle\Helper\TwilioClient;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;

class CreateTwilioVerifyServiceMutationSpec extends ObjectBehavior
{
    public function let(TwilioClient $twilioClient, EntityManagerInterface $em)
    {
        $this->beConstructedWith($twilioClient, $em);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CreateTwilioVerifyServiceMutation::class);
    }

    public function it_should_create_twilio_service(
        Arg $input,
        TwilioClient $twilioClient,
        EntityManagerInterface $em
    ) {
        $serviceName = 'serviceName';
        $input
            ->offsetGet('serviceName')
            ->shouldBeCalledOnce()
            ->willReturn($serviceName);

        $service = ['sid' => 'XXXXXX', 'friendly_name' => $serviceName];
        $response = ['statusCode' => 201, 'data' => $service];
        $twilioClient->createVerifyService($serviceName)->willReturn($response);

        $configServiceId = new ExternalServiceConfiguration();
        $configServiceId->setType('twilio_verify_service_sid');
        $configServiceId->setValue($service['sid']);
        $em->persist($configServiceId)->shouldBeCalledOnce();

        $configSenderName = new ExternalServiceConfiguration();
        $configSenderName->setType('twilio_verify_service_name');
        $configSenderName->setValue($service['friendly_name']);
        $em->persist($configSenderName)->shouldBeCalledOnce();

        $em->flush()->shouldBeCalled();

        $this->__invoke($input)->shouldBe([
            'errorCode' => null,
            'serviceName' => $serviceName,
        ]);
    }

    public function it_should_return_twilio_api_error_error_code(
        Arg $input,
        TwilioClient $twilioClient
    ) {
        $serviceName = 'abc';
        $input
            ->offsetGet('serviceName')
            ->shouldBeCalledOnce()
            ->willReturn($serviceName);
        $response = ['statusCode' => '400', 'data' => []];
        $twilioClient->createVerifyService($serviceName)->willReturn($response);

        $this->__invoke($input)->shouldBe([
            'errorCode' => CreateTwilioVerifyServiceMutation::TWILIO_API_ERROR,
        ]);
    }
}
