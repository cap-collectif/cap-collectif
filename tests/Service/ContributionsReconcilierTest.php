<?php

namespace Capco\Tests\Service;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Service\ParticipationWorkflow\ContributionsReconcilier;
use Capco\AppBundle\Service\ParticipationWorkflow\ProposalReconcillier;
use Capco\AppBundle\Service\ParticipationWorkflow\ReplyReconcilier;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\FilterCollection;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Public reconciliation rules use real contributions and assert ownership and retained content.
 */
final class ContributionsReconcilierTest extends TestCase
{
    /**
     * @dataProvider requirements
     *
     * @param list<string> $types
     */
    public function testRequirementsGateIdentityConflicts(string $targetType, array $types, ?string $email, bool $confirmed, ?string $phone, bool $phoneConfirmed, bool $allowed, bool $closed): void
    {
        $source = (new Participant())->setEmail($email)->setConfirmationToken($confirmed ? null : 'pending')->setPhone($phone)->setPhoneConfirmed($phoneConfirmed);
        $target = 'user' === $targetType ? new User() : new Participant();
        $target->setEmail('same@example.com')->setConfirmationToken(null)->setPhone('+33601010101')->setPhoneConfirmed(true);
        $step = (new CollectStep())->setTimeless(false)->setStartAt(new \DateTime('2020-01-01'))->setEndAt($closed ? new \DateTime('2020-01-02') : null);
        foreach ($types as $type) {
            $step->addRequirement((new Requirement())->setType($type));
        }
        $proposal = (new Proposal())->setProposalForm((new ProposalForm())->setStep($step))->setTitle('Retained title');
        $source->addProposal($proposal);

        $this->proposalReconciler()->reconcile($source, $target);

        self::assertSame($allowed ? $target : $source, $proposal->getContributor());
        self::assertSame('Retained title', $proposal->getTitle());

        $questionnaireStep = (new QuestionnaireStep())->setTimeless(false)->setStartAt(new \DateTime('2020-01-01'))->setEndAt($closed ? new \DateTime('2020-01-02') : null);
        foreach ($types as $type) {
            $questionnaireStep->addRequirement((new Requirement())->setType($type));
        }
        $questionnaire = (new Questionnaire())->setStep($questionnaireStep)->setMultipleRepliesAllowed(true);
        $reply = (new Reply())->setQuestionnaire($questionnaire);
        $source->addReply($reply);
        $questionnaires = $this->createStub(QuestionnaireRepository::class);
        $questionnaires->method('getWithRepliesByParticipant')->willReturn([$questionnaire]);
        $replies = $this->createStub(ReplyRepository::class);
        $replies->method('findBy')->willReturnCallback(static fn (array $criteria): array => ($criteria['participant'] ?? null) === $source ? [$reply] : []);

        (new ReplyReconcilier($this->entityManager(), $replies, $questionnaires))->reconcile($source, $target);

        $recipient = $allowed ? $target : $source;
        self::assertSame($recipient instanceof User ? $recipient : null, $reply->getAuthor());
        self::assertSame($recipient instanceof Participant ? $recipient : null, $reply->getParticipant());
    }

    /** @return iterable<string, array{string, list<string>, ?string, bool, ?string, bool, bool, bool}> */
    public static function requirements(): iterable
    {
        $cases = [
            'closed step' => [[Requirement::EMAIL_VERIFIED], 'same@example.com', true, null, false, false, true],
            'no requirement' => [[], 'same@example.com', true, '+33601010101', true, false],
            'SSO allows anonymous' => [[Requirement::SSO], null, false, null, false, true],
            'email missing' => [[Requirement::EMAIL_VERIFIED], null, false, null, false, true],
            'same confirmed email' => [[Requirement::EMAIL_VERIFIED], 'same@example.com', true, null, false, true],
            'unconfirmed email' => [[Requirement::EMAIL_VERIFIED], 'same@example.com', false, null, false, false],
            'different email' => [[Requirement::EMAIL_VERIFIED], 'other@example.com', true, null, false, false],
            'email case is significant' => [[Requirement::EMAIL_VERIFIED], 'SAME@example.com', true, null, false, false],
            'phone missing' => [[Requirement::PHONE_VERIFIED], null, true, null, false, false],
            'same confirmed phone' => [[Requirement::PHONE_VERIFIED], null, true, '+33601010101', true, true],
            'unconfirmed phone' => [[Requirement::PHONE_VERIFIED], null, true, '+33601010101', false, false],
            'different phone' => [[Requirement::PHONE_VERIFIED], null, true, '+33602020202', true, false],
            'email takes precedence over phone' => [[Requirement::EMAIL_VERIFIED, Requirement::PHONE_VERIFIED], 'other@example.com', true, '+33601010101', true, false],
            'SSO takes precedence over email' => [[Requirement::SSO, Requirement::EMAIL_VERIFIED], 'other@example.com', false, null, false, true],
        ];
        foreach (['user', 'participant'] as $target) {
            foreach ($cases as $name => $case) {
                yield $target . ': ' . $name => [$target, $case[0], $case[1], $case[2], $case[3], $case[4], $case[5], $case[6] ?? false];
            }
        }
    }

    public function testUnconfirmedTargetCannotReceiveConfirmedIdentityContributions(): void
    {
        $source = (new Participant())->setEmail('same@example.com')->setPhone('+33601010101')->setPhoneConfirmed(true);
        $target = (new Participant())->setEmail('same@example.com')->setConfirmationToken('pending')->setPhone('+33601010101');
        foreach ([Requirement::EMAIL_VERIFIED, Requirement::PHONE_VERIFIED] as $type) {
            $step = (new CollectStep())->setTimeless(true);
            $step->addRequirement((new Requirement())->setType($type));
            $proposal = (new Proposal())->setProposalForm((new ProposalForm())->setStep($step));
            $source->addProposal($proposal);
            $this->proposalReconciler()->reconcile($source, $target);
            self::assertSame($source, $proposal->getContributor());
        }
    }

    public function testContributorTransferIsIdempotentAndPreservesContent(): void
    {
        $source = new Participant();
        $target = new User();
        $collect = (new CollectStep())->setTimeless(true);
        $collect->addRequirement((new Requirement())->setType(Requirement::SSO));
        $proposal = (new Proposal())->setTitle('Original title')->setBody('Original body')->setProposalForm((new ProposalForm())->setStep($collect));
        $questionnaireStep = (new QuestionnaireStep())->setTimeless(true);
        $questionnaireStep->addRequirement((new Requirement())->setType(Requirement::SSO));
        $questionnaire = (new Questionnaire())->setStep($questionnaireStep)->setMultipleRepliesAllowed(true);
        $reply = (new Reply())->setQuestionnaire($questionnaire);
        $source->addProposal($proposal)->addReply($reply);
        $questionnaires = $this->createStub(QuestionnaireRepository::class);
        $questionnaires->method('getWithRepliesByParticipant')->willReturn([$questionnaire]);
        $replies = $this->createStub(ReplyRepository::class);
        $replies->method('findBy')->willReturnCallback(static fn (array $criteria): array => isset($criteria['participant']) && $reply->getParticipant() === $criteria['participant'] ? [$reply] : []);
        $proposalReconciler = $this->proposalReconciler();
        $replyReconciler = new ReplyReconcilier($this->entityManager(), $replies, $questionnaires);
        for ($attempt = 0; $attempt < 2; ++$attempt) {
            $proposalReconciler->reconcile($source, $target);
            $replyReconciler->reconcile($source, $target);
            foreach ([$proposal, $reply] as $contribution) {
                self::assertNull($contribution->getParticipant());
                self::assertSame($target, $contribution->getAuthor());
            }
        }
        $returnSource = new Participant();
        $returnSource->addProposal($proposal)->addReply($reply);
        $proposalReconciler->reconcile($returnSource, $source);
        $replyReconciler->reconcile($returnSource, $source);
        self::assertSame($source, $proposal->getContributor());
        self::assertSame($source, $reply->getParticipant());
        self::assertNull($reply->getAuthor());
        self::assertSame('Original title', $proposal->getTitle());
        self::assertSame('Original body', $proposal->getBody());
    }

    public function testParticipantMergeRotatesOnlyToken(): void
    {
        $existing = (new Participant())->setToken('old')->setEmail('existing@example.com')->setConsentPrivacyPolicy(true);
        $source = (new Participant())->setToken('new')->setEmail('source@example.com');
        $proposal = new Proposal();
        $existing->addProposal($proposal);
        $reconciler = new ContributionsReconcilier($this->createStub(EntityManagerInterface::class));
        $reconciler->updateParticipantInfos($existing, $source);
        $reconciler->updateParticipantInfos($existing, $source);
        self::assertSame('new', $existing->getToken());
        self::assertSame('existing@example.com', $existing->getEmail());
        self::assertTrue($existing->isConsentPrivacyPolicy());
        self::assertSame([$proposal], $existing->getProposals()->toArray());
    }

    private function proposalReconciler(): ProposalReconcillier
    {
        return new ProposalReconcillier($this->entityManager());
    }

    private function entityManager(): EntityManagerInterface
    {
        $em = $this->createStub(EntityManagerInterface::class);
        $filters = $this->createStub(FilterCollection::class);
        $filters->method('isEnabled')->willReturn(false);
        $em->method('getFilters')->willReturn($filters);

        return $em;
    }
}
