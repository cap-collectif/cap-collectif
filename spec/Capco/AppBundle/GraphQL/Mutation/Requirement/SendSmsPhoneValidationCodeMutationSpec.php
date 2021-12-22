<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation\Requirement;

use Capco\AppBundle\Entity\UserPhoneVerificationSms;
use Capco\AppBundle\GraphQL\Mutation\Requirement\SendSmsPhoneValidationCodeMutation;
use Capco\AppBundle\Helper\TwilioClient;
use Capco\AppBundle\Repository\UserPhoneVerificationSmsRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use PhpSpec\ObjectBehavior;
use Prophecy\Argument;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twilio\Exceptions\TwilioException;
use Twilio\Rest\Api\V2010\Account\MessageInstance;

class SendSmsPhoneValidationCodeMutationSpec extends ObjectBehavior
{

    public function let(
        EntityManagerInterface             $em,
        TwilioClient                       $twilioClient,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        TranslatorInterface                $translator,
        SiteParameterResolver              $siteParameterResolver
    )
    {

        $this->beConstructedWith(
            $em,
            $twilioClient,
            $userPhoneVerificationSmsRepository,
            $translator,
            $siteParameterResolver
        );
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(SendSmsPhoneValidationCodeMutation::class);
    }

    public function it_should_send_a_phone_validation_sms_successfuly(
        MessageInstance                    $message,
        TwilioClient                       $twilioClient,
        Arg                                $input,
        User                               $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        UserPhoneVerificationSms           $sms,
        SiteParameterResolver              $siteParameterResolver,
        TranslatorInterface                $translator,
        EntityManagerInterface             $em
    )
    {
        $siteName = 'Capco';
        $siteParameterResolver->getValue('global.site.fullname')->shouldBeCalledOnce()->willReturn($siteName);

        $body = 'abc';
        $translator->trans('phone.verify.sms.body', Argument::any(), 'CapcoAppBundle')->shouldBeCalledOnce()->willReturn($body);
        $to = '+3333333';
        $messagingServiceId = 'XXXX';
        $twilioClient->getServiceId()->willReturn($messagingServiceId);

        $viewer->isPhoneConfirmed()->shouldBeCalledOnce()->willReturn(false);
        $viewer->getPhone()->shouldBeCalledOnce()->willReturn($to);

        $smsList = [$sms];
        $userPhoneVerificationSmsRepository
            ->findByUserWithinOneMinuteRange($viewer)
            ->shouldBeCalledOnce()
            ->willReturn($smsList);

        $twilioClient->send($to, $body, $messagingServiceId)->shouldBeCalledOnce()->willReturn($message);

        $em->persist(Argument::type(UserPhoneVerificationSms::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledTimes(2);

        $message->errorCode = null;
        $message->status = 'accepted';

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe(null);
    }

    public function it_should_return_phone_already_confirmed_error_code(
        User $viewer,
        Arg  $input
    )
    {
        $viewer->isPhoneConfirmed()->willReturn(true);
        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe('PHONE_ALREADY_CONFIRMED');
    }

    public function it_should_return_retry_limit_reached_error_code(
        User                               $viewer,
        Arg                                $input,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        UserPhoneVerificationSms           $sms,
        UserPhoneVerificationSms           $sms2
    )
    {
        $viewer->isPhoneConfirmed()->willReturn(false);

        $smsList = [$sms, $sms2];
        $userPhoneVerificationSmsRepository->findByUserWithinOneMinuteRange($viewer)
            ->shouldBeCalledOnce()
            ->willReturn($smsList);

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe('RETRY_LIMIT_REACHED');
    }

    public function it_should_return_undelivered_error_code(
        MessageInstance                    $message,
        TwilioClient                       $twilioClient,
        Arg                                $input,
        User                               $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        UserPhoneVerificationSms           $sms,
        SiteParameterResolver              $siteParameterResolver,
        TranslatorInterface                $translator,
        EntityManagerInterface             $em
    )
    {
        $siteName = 'Capco';
        $siteParameterResolver->getValue('global.site.fullname')->shouldBeCalledOnce()->willReturn($siteName);

        $body = 'abc';
        $translator->trans('phone.verify.sms.body', Argument::any(), 'CapcoAppBundle')->shouldBeCalledOnce()->willReturn($body);
        $to = '+3333333';
        $messagingServiceId = 'XXXX';
        $twilioClient->getServiceId()->willReturn($messagingServiceId);

        $viewer->isPhoneConfirmed()->shouldBeCalledOnce()->willReturn(false);
        $viewer->getPhone()->shouldBeCalledOnce()->willReturn($to);

        $smsList = [$sms];
        $userPhoneVerificationSmsRepository
            ->findByUserWithinOneMinuteRange($viewer)
            ->shouldBeCalledOnce()
            ->willReturn($smsList);

        $twilioClient->send($to, $body, $messagingServiceId)->shouldBeCalledOnce()->willReturn($message);

        $em->persist(Argument::type(UserPhoneVerificationSms::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledTimes(2);

        $message->errorCode = 'error';
        $message->status = 'undelivered';

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe('UNDELIVERED');
    }

    public function it_should_return_invalid_number_error_code(
        MessageInstance                    $message,
        TwilioClient                       $twilioClient,
        Arg                                $input,
        User                               $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        UserPhoneVerificationSms           $sms,
        SiteParameterResolver              $siteParameterResolver,
        TranslatorInterface                $translator,
        EntityManagerInterface             $em
    )
    {
        $siteName = 'Capco';
        $siteParameterResolver->getValue('global.site.fullname')->shouldBeCalledOnce()->willReturn($siteName);

        $body = 'abc';
        $translator->trans('phone.verify.sms.body', Argument::any(), 'CapcoAppBundle')->shouldBeCalledOnce()->willReturn($body);
        $to = '+3333333';
        $messagingServiceId = 'XXXX';
        $twilioClient->getServiceId()->willReturn($messagingServiceId);

        $viewer->isPhoneConfirmed()->shouldBeCalledOnce()->willReturn(false);
        $viewer->getPhone()->shouldBeCalledOnce()->willReturn($to);

        $smsList = [$sms];
        $userPhoneVerificationSmsRepository
            ->findByUserWithinOneMinuteRange($viewer)
            ->shouldBeCalledOnce()
            ->willReturn($smsList);

        $twilioClient->send($to, $body, $messagingServiceId)->shouldBeCalledOnce()->willReturn($message)->willThrow(new TwilioException('', 21211));

        $em->persist(Argument::type(UserPhoneVerificationSms::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledTimes(2);

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe('INVALID_NUMBER');
    }

    public function it_should_return_messaging_service_id_not_found_error_code(
        MessageInstance                    $message,
        TwilioClient                       $twilioClient,
        Arg                                $input,
        User                               $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        UserPhoneVerificationSms           $sms,
        SiteParameterResolver              $siteParameterResolver,
        TranslatorInterface                $translator,
        EntityManagerInterface             $em
    )
    {
        $siteName = 'Capco';
        $siteParameterResolver->getValue('global.site.fullname')->shouldBeCalledOnce()->willReturn($siteName);

        $body = 'abc';
        $translator->trans('phone.verify.sms.body', Argument::any(), 'CapcoAppBundle')->shouldBeCalledOnce()->willReturn($body);
        $to = '+3333333';

        $viewer->isPhoneConfirmed()->shouldBeCalledOnce()->willReturn(false);
        $viewer->getPhone()->shouldBeCalledOnce()->willReturn($to);

        $smsList = [$sms];
        $userPhoneVerificationSmsRepository
            ->findByUserWithinOneMinuteRange($viewer)
            ->shouldBeCalledOnce()
            ->willReturn($smsList);


        $messagingServiceId = null;
        $twilioClient->getServiceId()->willReturn($messagingServiceId);

        $em->persist(Argument::type(UserPhoneVerificationSms::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledTimes(2);

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe('MESSAGING_SERVICE_ID_NOT_FOUND');
    }

    public function it_should_return_undelivered_error_code_on_exception(
        MessageInstance                    $message,
        TwilioClient                       $twilioClient,
        Arg                                $input,
        User                               $viewer,
        UserPhoneVerificationSmsRepository $userPhoneVerificationSmsRepository,
        UserPhoneVerificationSms           $sms,
        SiteParameterResolver              $siteParameterResolver,
        TranslatorInterface                $translator,
        EntityManagerInterface             $em
    )
    {
        $_ENV = ['TWILIO_MESSAGING_SERVICE_ID' => 'XXXXX'];
        $siteName = 'Capco';
        $siteParameterResolver->getValue('global.site.fullname')->shouldBeCalledOnce()->willReturn($siteName);

        $body = 'abc';
        $translator->trans('phone.verify.sms.body', Argument::any(), 'CapcoAppBundle')->shouldBeCalledOnce()->willReturn($body);
        $to = '+3333333';
        $messagingServiceId = 'XXXX';
        $twilioClient->getServiceId()->willReturn($messagingServiceId);

        $viewer->isPhoneConfirmed()->shouldBeCalledOnce()->willReturn(false);
        $viewer->getPhone()->shouldBeCalledOnce()->willReturn($to);

        $smsList = [$sms];
        $userPhoneVerificationSmsRepository
            ->findByUserWithinOneMinuteRange($viewer)
            ->shouldBeCalledOnce()
            ->willReturn($smsList);

        $twilioClient->send($to, $body, $messagingServiceId)->shouldBeCalledOnce()->willReturn($message)->willThrow(new TwilioException());

        $em->persist(Argument::type(UserPhoneVerificationSms::class))->shouldBeCalledOnce();
        $em->flush()->shouldBeCalledOnce();

        $payload = $this->__invoke($input, $viewer);
        $payload['errorCode']->shouldBe('UNDELIVERED');
    }

}
