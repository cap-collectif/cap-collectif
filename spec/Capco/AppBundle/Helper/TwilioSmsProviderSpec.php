<?php

namespace spec\Capco\AppBundle\Helper;

use Capco\AppBundle\Enum\SendSMSErrorCode;
use Capco\AppBundle\Enum\UserPhoneErrors;
use Capco\AppBundle\Enum\VerifySMSErrorCode;
use Capco\AppBundle\Helper\TwilioClient;
use Capco\AppBundle\Helper\TwilioSmsProvider;
use PhpSpec\ObjectBehavior;

class TwilioSmsProviderSpec extends ObjectBehavior
{
    private string $phone = '+33611111111';
    private string $code = '123456';

    public function let(TwilioClient $twilioClient): void
    {
        $this->beConstructedWith($twilioClient);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(TwilioSmsProvider::class);
    }

    public function it_should_send_sms_correctly(TwilioClient $twilioClient): void
    {
        $response = ['statusCode' => 201];
        $twilioClient
            ->sendVerificationCode($this->phone)
            ->shouldBeCalledOnce()
            ->willReturn($response)
        ;

        $this->sendVerificationSms($this->phone)->shouldReturn(null);
    }

    public function it_should_return_PHONE_SHOULD_BE_MOBILE_NUMBER(TwilioClient $twilioClient): void
    {
        $response = [
            'statusCode' => 400,
            'data' => ['code' => TwilioClient::ERRORS['LANDLINE_NUMBER_NOT_SUPPORTED']],
        ];
        $twilioClient
            ->sendVerificationCode($this->phone)
            ->shouldBeCalledOnce()
            ->willReturn($response)
        ;

        $this->sendVerificationSms($this->phone)->shouldReturn(
            UserPhoneErrors::PHONE_SHOULD_BE_MOBILE_NUMBER
        );
    }

    public function it_should_return_INVALID_NUMBER(TwilioClient $twilioClient): void
    {
        $response = [
            'statusCode' => 400,
            'data' => ['code' => TwilioClient::ERRORS['INVALID_PARAMETER']],
        ];
        $twilioClient
            ->sendVerificationCode($this->phone)
            ->shouldBeCalledOnce()
            ->willReturn($response)
        ;

        $this->sendVerificationSms($this->phone)->shouldReturn(SendSMSErrorCode::INVALID_NUMBER);
    }

    public function it_should_return_SERVER_ERROR(TwilioClient $twilioClient): void
    {
        $response = ['statusCode' => 500];
        $twilioClient
            ->sendVerificationCode($this->phone)
            ->shouldBeCalledOnce()
            ->willReturn($response)
        ;

        $this->sendVerificationSms($this->phone)->shouldReturn(SendSMSErrorCode::SERVER_ERROR);
    }

    public function it_should_verify_sms_correctly(TwilioClient $twilioClient): void
    {
        $response = ['statusCode' => 200, 'data' => ['status' => 'accepted']];
        $twilioClient
            ->checkVerificationCode($this->phone, $this->code)
            ->shouldBeCalledOnce()
            ->willReturn($response)
        ;
        $this->verifySms($this->phone, $this->code)->shouldReturn(null);
    }

    public function it_should_return_CODE_EXPIRED(TwilioClient $twilioClient): void
    {
        $response = ['statusCode' => 404, 'data' => ['code' => TwilioClient::ERRORS['NOT_FOUND']]];
        $twilioClient
            ->checkVerificationCode($this->phone, $this->code)
            ->shouldBeCalledOnce()
            ->willReturn($response)
        ;
        $this->verifySms($this->phone, $this->code)->shouldReturn(VerifySMSErrorCode::CODE_EXPIRED);
    }

    public function it_should_return_CODE_NOT_VALID(TwilioClient $twilioClient): void
    {
        $response = ['statusCode' => 200, 'data' => ['status' => 'pending']];
        $twilioClient
            ->checkVerificationCode($this->phone, $this->code)
            ->shouldBeCalledOnce()
            ->willReturn($response)
        ;
        $this->verifySms($this->phone, $this->code)->shouldReturn(VerifySMSErrorCode::CODE_NOT_VALID);
    }
}
