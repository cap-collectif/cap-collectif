<?php
namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\GraphQL\Mutation\CreateTwilioServiceMutation;
use Capco\AppBundle\Helper\TwilioClient;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Twilio\Exceptions\TwilioException;
use Twilio\Rest\Messaging\V1\ServiceInstance;
use Twilio\Rest\Messaging\V1\Service\AlphaSenderInstance;


class CreateTwilioServiceMutationSpec extends ObjectBehavior
{
    public function let(
        TwilioClient $twilioClient,
        EntityManagerInterface $em
    ) {
        $this->beConstructedWith($twilioClient, $em);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(CreateTwilioServiceMutation::class);
    }

    public function it_should_create_twilio_service(
        Arg $input,
        TwilioClient $twilioClient,
        ServiceInstance $serviceInstance,
        AlphaSenderInstance $alphaSenderInstance,
        EntityManagerInterface $em
    )
    {
        $serviceName = 'abc';
        $input->offsetGet('serviceName')->shouldBeCalledOnce()->willReturn($serviceName);
        $twilioClient->isSenderNameValid($serviceName)->willReturn(true);
        $twilioClient->createService($serviceName)->shouldBeCalledOnce()->willReturn($serviceInstance);
        $twilioClient->createAlphaSender($serviceName)->shouldBeCalledOnce()->willReturn($alphaSenderInstance);

        $serviceInstance->sid = 'serviceId';
        $alphaSenderInstance->sid = 'senderId';
        $alphaSenderInstance->alphaSender = 'senderName';

        $configServiceId = new ExternalServiceConfiguration();
        $configServiceId->setType('twilio_service_id');
        $configServiceId->setValue('serviceId');
        $em->persist($configServiceId)->shouldBeCalledOnce();

        $configSenderId = new ExternalServiceConfiguration();
        $configSenderId->setType('twilio_alpha_sender_id');
        $configSenderId->setValue('senderId');
        $em->persist($configSenderId)->shouldBeCalledOnce();

        $configSenderName = new ExternalServiceConfiguration();
        $configSenderName->setType('twilio_alpha_sender_name');
        $configSenderName->setValue('senderName');
        $em->persist($configSenderName)->shouldBeCalledOnce();


        $em->flush()->shouldBeCalled();

        $this->__invoke($input)->shouldBe([
            'errorCode' => null,
            'serviceName' => $serviceName
        ]);
    }

    public function it_should_return_error_code_if_exception_thrown(
        Arg $input,
        TwilioClient $twilioClient,
        ServiceInstance $serviceInstance
    )
    {
        $serviceName = 'abc';
        $input->offsetGet('serviceName')->shouldBeCalledOnce()->willReturn($serviceName);
        $twilioClient->isSenderNameValid($serviceName)->willReturn(true);
        $twilioClient->createService($serviceName)->shouldBeCalledOnce()->willReturn($serviceInstance)->willThrow(TwilioException::class);

        $this->__invoke($input)->shouldBe([
            'errorCode' => CreateTwilioServiceMutation::COULD_NOT_CREATE_SERVICE
        ]);
    }

    public function it_should_return_invalid_sender_name_error_code(
        Arg $input,
        TwilioClient $twilioClient
    )
    {
        $serviceName = 'abc';
        $input->offsetGet('serviceName')->shouldBeCalledOnce()->willReturn($serviceName);
        $twilioClient->isSenderNameValid($serviceName)->willReturn(false);

        $this->__invoke($input)->shouldBe([
            'errorCode' => CreateTwilioServiceMutation::INVALID_SENDER_NAME
        ]);
    }


}