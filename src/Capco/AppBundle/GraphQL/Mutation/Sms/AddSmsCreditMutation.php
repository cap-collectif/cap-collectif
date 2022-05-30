<?php

namespace Capco\AppBundle\GraphQL\Mutation\Sms;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Entity\SmsCredit;
use Capco\AppBundle\Entity\SmsOrder;
use Capco\AppBundle\Form\SmsCreditType;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\TwilioClient;
use Capco\AppBundle\Notifier\SmsNotifier;
use Capco\AppBundle\Repository\SmsCreditRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Form\FormFactoryInterface;
use Twilio\Exceptions\TwilioException;

class AddSmsCreditMutation implements MutationInterface
{
    public const ORDER_ALREADY_PROCESSED = 'ORDER_ALREADY_PROCESSED';
    public const SMS_ORDER_NOT_FOUND = 'SMS_ORDER_NOT_FOUND';
    public const TWILIO_API_ERROR = 'TWILIO_API_ERROR';

    private EntityManagerInterface $em;
    private SmsNotifier $notifier;
    private SmsCreditRepository $smsCreditRepository;
    private GlobalIdResolver $globalIdResolver;
    private FormFactoryInterface $formFactory;
    private TwilioClient $twilioClient;
    private SiteParameterResolver $siteParameterResolver;
    private LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $em,
        SmsNotifier $notifier,
        SmsCreditRepository $smsCreditRepository,
        GlobalIdResolver $globalIdResolver,
        FormFactoryInterface $formFactory,
        TwilioClient $twilioClient,
        SiteParameterResolver $siteParameterResolver,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->notifier = $notifier;
        $this->smsCreditRepository = $smsCreditRepository;
        $this->globalIdResolver = $globalIdResolver;
        $this->formFactory = $formFactory;
        $this->twilioClient = $twilioClient;
        $this->siteParameterResolver = $siteParameterResolver;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $smsOrderId = $input->offsetGet('smsOrder');

        /** * @var SmsOrder $smsOrder  */
        $smsOrder = $this->globalIdResolver->resolve($smsOrderId, $viewer);

        if (!$smsOrder) {
            return ['errorCode' => self::SMS_ORDER_NOT_FOUND];
        }

        $values = $input->getArrayCopy();

        $smsCredit = new SmsCredit();
        $form = $this->formFactory->create(SmsCreditType::class, $smsCredit);
        $form->submit($values, false);

        if (!$form->isValid()) {
            $errors = $form->getErrors(true, true);
            foreach ($errors as $error) {
                if ($error->getMessageTemplate() === 'This value is already used.') {
                    return ['errorCode' => self::ORDER_ALREADY_PROCESSED];
                }
            }
        }

        $smsCreditsCount = $this->smsCreditRepository->countAll();

        if ($smsCreditsCount > 0) {
            $this->notifier->onRefillSmsCredit($smsCredit);
        } else {
            $subAccountErrorCode = $this->createTwilioSubAccount();
            $verifyServiceErrorCode = $this->createTwilioVerifyServiceName();
            if ($subAccountErrorCode || $verifyServiceErrorCode) {
                return ['errorCode' => self::TWILIO_API_ERROR];
            }
            $this->notifier->onInitialSmsCredit($smsCredit);
        }

        $smsOrder->setIsProcessed(true);
        $this->em->persist($smsOrder);
        $this->em->persist($smsCredit);
        $this->em->flush();

        return ['smsCredit' => $smsCredit];
    }

    private function createTwilioSubAccount(): ?string
    {
        try {
            $organizationName = $this->siteParameterResolver->getValue('global.site.organization_name');
            $subAccount = $this->twilioClient->createSubAccount($organizationName);
            $this->persistExternalServiceConfiguration('twilio_subaccount_sid', $subAccount->sid);
            $this->persistExternalServiceConfiguration('twilio_subaccount_auth_token', $subAccount->authToken);
            $this->em->flush();
            return null;
        } catch (TwilioException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            return self::TWILIO_API_ERROR;
        }
    }

    private function createTwilioVerifyServiceName(): ?string
    {
        $organizationName = $this->siteParameterResolver->getValue('global.site.organization_name');
        $response = $this->twilioClient->createVerifyService($organizationName);
        $statusCode = $response['statusCode'];

        if ($statusCode !== 201) return self::TWILIO_API_ERROR;

        $service = $response['data'];
        $this->persistExternalServiceConfiguration(
            'twilio_verify_service_sid',
            $service['sid']
        );
        $this->persistExternalServiceConfiguration(
            'twilio_verify_service_name',
            $service['friendly_name']
        );
        $this->em->flush();
        return null;
    }

    private function persistExternalServiceConfiguration(string $type, string $value): void
    {
        $config = new ExternalServiceConfiguration();
        $config->setType($type);
        $config->setValue($value);
        $this->em->persist($config);
    }
}
