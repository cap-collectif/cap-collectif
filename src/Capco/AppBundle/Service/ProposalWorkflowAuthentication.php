<?php

namespace Capco\AppBundle\Service;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Exception\RecentlySentException;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Participant\ParticipantConfirmEmailMessage;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Resolver\UrlResolver;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Predis\Client;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProposalWorkflowAuthentication
{
    public function __construct(
        private readonly Client $redis,
        private readonly EmailRateLimiter $rateLimiter,
        private readonly MailerService $mailer,
        private readonly RouterInterface $router,
        private readonly UrlResolver $urlResolver,
        private readonly ParticipantRepository $participants,
    ) {}

    public function request(Proposal $proposal): void
    {
        $participant = $proposal->getParticipant();
        if (!$participant || !$participant->getEmail()) {
            throw new \LogicException('A participant email is required to resume the workflow.');
        }

        try {
            $this->rateLimiter->rateLimit('proposal.workflow.authentication.' . $proposal->getId());
        } catch (RecentlySentException) {
            return;
        }

        $token = bin2hex(random_bytes(32));
        $key = 'proposal_workflow_authentication:' . hash('sha256', $token);
        $redirectUrl = $this->urlResolver->getStepUrl($proposal->getStep(), true) . '?' . http_build_query([
            'workflow' => '',
            'contributionId' => GlobalId::toGlobalId('Proposal', $proposal->getId()),
        ]);
        $this->redis->setex($key, 900, json_encode([
            'participantId' => $participant->getId(),
            'email' => $participant->getEmail(),
            'tokenHash' => hash('sha256', $participant->getToken()),
            'redirectUrl' => $redirectUrl,
        ], \JSON_THROW_ON_ERROR));

        try {
            $sent = $this->mailer->createAndSendMessage(
                ParticipantConfirmEmailMessage::class,
                $participant,
                ['confirmationURL' => $this->router->generate('app_proposal_workflow_authenticate', ['token' => $token], UrlGeneratorInterface::ABSOLUTE_URL)],
                $participant,
                $participant->getEmail()
            );
            if (!$sent) {
                throw new \RuntimeException('Unable to send the workflow authentication email.');
            }
        } catch (\Throwable $exception) {
            $this->redis->del($key);

            throw $exception;
        }
    }

    /** @return array{participant: Participant, redirectUrl: string} */
    public function consume(string $token): array
    {
        // Consume atomically so concurrent requests cannot reuse the same email proof.
        $data = $this->redis->eval("local value = redis.call('GET', KEYS[1]); redis.call('DEL', KEYS[1]); return value", 1, 'proposal_workflow_authentication:' . hash('sha256', $token));
        if (!\is_string($data)) {
            throw new NotFoundHttpException();
        }
        $data = json_decode($data, true, 512, \JSON_THROW_ON_ERROR);
        $participant = $this->participants->find($data['participantId']);
        if (!$participant || $participant->getEmail() !== $data['email'] || !hash_equals($data['tokenHash'], hash('sha256', $participant->getToken()))) {
            throw new NotFoundHttpException();
        }

        return ['participant' => $participant, 'redirectUrl' => $data['redirectUrl']];
    }
}
