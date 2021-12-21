<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\ExternalServiceConfiguration;
use Capco\AppBundle\Helper\TwilioClient;
use Capco\AppBundle\Repository\ExternalServiceConfigurationRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Twilio\Exceptions\TwilioException;

class UpdateTwilioAlphaSenderMutation implements MutationInterface
{

    public const COULD_NOT_UPDATE_ALPHA_SENDER = 'COULD_NOT_UPDATE_ALPHA_SENDER';
    public const ALPHA_SENDER_ID_NOT_FOUND = 'ALPHA_SENDER_ID_NOT_FOUND';

    private TwilioClient $twilioClient;
    private EntityManagerInterface $em;
    private ExternalServiceConfigurationRepository $externalServiceConfigurationRepository;
    private LoggerInterface $logger;

    public function __construct(
        TwilioClient $twilioClient,
        EntityManagerInterface $em,
        ExternalServiceConfigurationRepository $externalServiceConfigurationRepository,
        LoggerInterface $logger
    ) {
        $this->twilioClient = $twilioClient;
        $this->em = $em;
        $this->externalServiceConfigurationRepository = $externalServiceConfigurationRepository;
        $this->logger = $logger;
    }

    public function __invoke(Argument $input): array
    {
        $alphaSenderIdConfig = $this->externalServiceConfigurationRepository->findOneBy(['type' => 'twilio_alpha_sender_id']);

        if (!$alphaSenderIdConfig) {
            return ['errorCode' => self::ALPHA_SENDER_ID_NOT_FOUND];
        }
        $alphaSenderName = $input->offsetGet('alphaSenderName');
        try {
            $isSuccessfullyDeleted = $this->twilioClient->deleteAlphaSender($alphaSenderIdConfig->getValue());
            if (!$isSuccessfullyDeleted) {
                return ['errorCode' => self::COULD_NOT_UPDATE_ALPHA_SENDER];
            }
            $alphaSender = $this->twilioClient->createAlphaSender($alphaSenderName);

            $alphaSenderNameConfig = $this->externalServiceConfigurationRepository->findOneBy(['type' => 'twilio_alpha_sender_name']);
            $alphaSenderNameConfig->setValue($alphaSender->alphaSender);
            $alphaSenderIdConfig->setValue($alphaSender->sid);

            $this->em->flush();
        } catch (TwilioException $e) {
            $this->logger->error(
                __METHOD__ . ' => ' . $e->getCode() . ' : ' . $e->getMessage()
            );
            return ['errorCode' => self::COULD_NOT_UPDATE_ALPHA_SENDER];
        }
        return ['errorCode' => null, 'alphaSenderName' => $alphaSenderName];
    }
}
