<?php
namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\GraphQL\Mutation\UpdateTwilioAlphaSenderMutation;
use Capco\AppBundle\Helper\TwilioClient;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;
use Twilio\Exceptions\TwilioException;
use Twilio\Rest\Messaging\V1\Service\AlphaSenderInstance;

class UpdateTwilioAlphaSenderMutationSpec extends ObjectBehavior
{
    public function let(
        TwilioClient $twilioClient,
        EntityManagerInterface $em,
        ExternalServiceConfigurationRepository $externalServiceConfigurationRepository,
        LoggerInterface $loggerInterface
    ) {
        $this->beConstructedWith($twilioClient, $em, $externalServiceConfigurationRepository, $loggerInterface);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(UpdateTwilioAlphaSenderMutation::class);
    }

    public function it_should_update_alpha_sender(
        Arg $input,
        TwilioClient $twilioClient,
        AlphaSenderInstance $alphaSender,
        EntityManagerInterface $em,
        ExternalServiceConfigurationRepository $externalServiceConfigurationRepository,
        ExternalServiceConfiguration $alphaSenderIdConfig,
        ExternalServiceConfiguration $alphaSenderNameConfig
    )
    {
        $alphaSenderSid = 'XXXXXXX';
        $alphaSenderName = 'abc';

        $externalServiceConfigurationRepository->findOneBy(['type' => 'twilio_alpha_sender_id'])->shouldBeCalledOnce()->willReturn($alphaSenderIdConfig);
        $alphaSenderIdConfig->getValue()->shouldBeCalledOnce()->willReturn($alphaSenderSid);

        $input->offsetGet('alphaSenderName')->shouldBeCalledOnce()->willReturn($alphaSenderName);
        $twilioClient->deleteAlphaSender($alphaSenderSid)->shouldBeCalledOnce()->willReturn(true);
        $twilioClient->createAlphaSender($alphaSenderName)->shouldBeCalledOnce()->willReturn($alphaSender);

        $externalServiceConfigurationRepository->findOneBy(['type' => 'twilio_alpha_sender_name'])->willReturn($alphaSenderNameConfig);

        $alphaSender->alphaSender = 'abc';
        $alphaSender->sid = 'XXX';
        $alphaSenderNameConfig->setValue('abc')->shouldBeCalledOnce();
        $alphaSenderIdConfig->setValue('XXX')->shouldBeCalledOnce();

        $em->flush()->shouldBeCalledOnce();

        $this->__invoke($input)->shouldBe([
            'errorCode' => null,
            'alphaSenderName' => $alphaSenderName
        ]);
    }

    public function it_should_return_error_code_if_sender_delete_is_not_successful(
        Arg $input,
        TwilioClient $twilioClient,
        ExternalServiceConfigurationRepository $externalServiceConfigurationRepository,
        ExternalServiceConfiguration $alphaSenderIdConfig
    )
    {
        $alphaSenderSid = 'XXXXXXX';
        $alphaSenderName = 'abc';
        $externalServiceConfigurationRepository->findOneBy(['type' => 'twilio_alpha_sender_id'])->shouldBeCalledOnce()->willReturn($alphaSenderIdConfig);
        $alphaSenderIdConfig->getValue()->shouldBeCalledOnce()->willReturn($alphaSenderSid);
        $input->offsetGet('alphaSenderName')->shouldBeCalledOnce()->willReturn($alphaSenderName);
        $twilioClient->deleteAlphaSender($alphaSenderSid)->shouldBeCalledOnce()->willReturn(false);

        $this->__invoke($input)->shouldBe([
            'errorCode' => UpdateTwilioAlphaSenderMutation::COULD_NOT_UPDATE_ALPHA_SENDER,
        ]);
    }

    public function it_should_return_error_code_if_exception_is_thrown(
        Arg $input,
        TwilioClient $twilioClient,
        ExternalServiceConfigurationRepository $externalServiceConfigurationRepository,
        ExternalServiceConfiguration $alphaSenderIdConfig
    )
    {
        $alphaSenderSid = 'XXXXXXX';
        $alphaSenderName = 'abc';

        $externalServiceConfigurationRepository->findOneBy(['type' => 'twilio_alpha_sender_id'])->shouldBeCalledOnce()->willReturn($alphaSenderIdConfig);
        $alphaSenderIdConfig->getValue()->shouldBeCalledOnce()->willReturn($alphaSenderSid);

        $input->offsetGet('alphaSenderName')->shouldBeCalledOnce()->willReturn($alphaSenderName);
        $twilioClient->deleteAlphaSender($alphaSenderSid)->shouldBeCalledOnce()->willReturn(true)->willThrow(TwilioException::class);

        $this->__invoke($input)->shouldBe([
            'errorCode' => UpdateTwilioAlphaSenderMutation::COULD_NOT_UPDATE_ALPHA_SENDER,
        ]);
    }

}
