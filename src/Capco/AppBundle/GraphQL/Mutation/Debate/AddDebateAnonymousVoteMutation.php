<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateAnonymousVote;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Utils\RequestGuesser;
use Capco\AppBundle\Validator\Constraints\CaptchaConstraint;
use Doctrine\DBAL\Driver\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use FOS\UserBundle\Util\TokenGeneratorInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Psr\Log\LoggerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AddDebateAnonymousVoteMutation implements MutationInterface
{
    use MutationTrait;

    public const UNKNOWN_DEBATE = 'UNKNOWN_DEBATE';
    public const CLOSED_DEBATE = 'CLOSED_DEBATE';
    public const INVALID_CAPTCHA = 'INVALID_CAPTCHA';

    private EntityManagerInterface $em;
    private LoggerInterface $logger;
    private GlobalIdResolver $globalIdResolver;
    private ValidatorInterface $validator;
    private TokenGeneratorInterface $tokenGenerator;
    private Indexer $indexer;
    private RequestGuesser $requestGuesser;

    public function __construct(
        EntityManagerInterface $em,
        LoggerInterface $logger,
        GlobalIdResolver $globalIdResolver,
        ValidatorInterface $validator,
        TokenGeneratorInterface $tokenGenerator,
        Indexer $indexer,
        RequestGuesser $requestGuesser
    ) {
        $this->em = $em;
        $this->logger = $logger;
        $this->globalIdResolver = $globalIdResolver;
        $this->validator = $validator;
        $this->tokenGenerator = $tokenGenerator;
        $this->indexer = $indexer;
        $this->requestGuesser = $requestGuesser;
    }

    public function __invoke(Arg $input): array
    {
        $this->formatInput($input);
        $debateId = $input->offsetGet('debateId');
        $debate = $this->globalIdResolver->resolve($debateId, null);

        if (!$debate || !$debate instanceof Debate) {
            $this->logger->error('Unknown argument `debateId`.', ['id' => $debateId]);

            return $this->generateErrorPayload(self::UNKNOWN_DEBATE);
        }

        if (!$debate->getStep()->isOpen()) {
            $this->logger->error('The debate is not open.', ['id' => $debateId]);

            return $this->generateErrorPayload(self::CLOSED_DEBATE);
        }

        $captcha = $input->offsetGet('captcha');
        $errors = $this->validator->validate($captcha, [new CaptchaConstraint()]);
        if (\count($errors) > 0) {
            return $this->generateErrorPayload(self::INVALID_CAPTCHA);
        }

        $type = $input->offsetGet('type');

        $debateAnonymousVote = (new DebateAnonymousVote())
            ->setToken($this->tokenGenerator->generateToken())
            ->setDebate($debate)
            ->setType($type)
            ->setNavigator($this->requestGuesser->getUserAgent())
            ->setIpAddress($this->requestGuesser->getClientIp())
        ;
        self::setOrigin($debateAnonymousVote, $input);

        $this->em->persist($debateAnonymousVote);

        try {
            $this->em->flush();
            $this->indexer->index(DebateAnonymousVote::class, $debateAnonymousVote->getId());
            $this->indexer->finishBulk();
        } catch (DriverException $e) {
            $this->logger->error(
                __METHOD__ . ' => ' . $e->getErrorCode() . ' : ' . $e->getMessage()
            );

            throw new UserError('Internal error, please try again.');
        }

        return $this->generateSuccessFulPayload($debateAnonymousVote);
    }

    private function generateSuccessFulPayload(DebateAnonymousVote $vote): array
    {
        return [
            'token' => $vote->getToken(),
            'debateAnonymousVote' => $vote,
            'errorCode' => null,
        ];
    }

    private function generateErrorPayload(string $message): array
    {
        return ['debateAnonymousVote' => null, 'errorCode' => $message];
    }

    private static function setOrigin(DebateAnonymousVote $vote, Arg $input): DebateAnonymousVote
    {
        $widgetOriginURI = $input->offsetGet('widgetOriginURI');
        if ($widgetOriginURI) {
            $vote->setWidgetOriginUrl($widgetOriginURI);
        }

        return $vote;
    }
}
