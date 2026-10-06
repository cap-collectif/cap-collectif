<?php

namespace Capco\Tests\Participant\Functional;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Requirement;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason HTTP login and phone reconciliation verify reloaded contributions and answers with SQL isolation.
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
final class ContributionReconciliationTest extends ParticipantWebTestCase
{
    /** @dataProvider transfers */
    public function testReconciliationKeepsAssociatedContent(bool $toUser, bool $matching, bool $closed): void
    {
        $email = $this->uniqueEmail();
        $source = (new Participant())->setToken(bin2hex(random_bytes(24)))->setEmail($email)->setPhone('+33609988771');
        $targetEmail = $matching ? $email : $this->uniqueEmail();
        $target = $toUser ? $this->account($targetEmail) : (new Participant())->setToken(bin2hex(random_bytes(24)))->setEmail($targetEmail);
        $target->setPhone('+33609988771')->setPhoneConfirmed(true);
        $this->em->persist($source);
        $this->em->persist($target);
        $collect = $this->em->getRepository(CollectStep::class)->find('collectstep1');
        $questionnaireStep = $this->em->getRepository(QuestionnaireStep::class)->find('questionnairestep1');
        self::assertInstanceOf(CollectStep::class, $collect);
        self::assertInstanceOf(QuestionnaireStep::class, $questionnaireStep);
        $this->configure($collect, $closed);
        $this->configure($questionnaireStep, $closed);
        $questionnaire = $questionnaireStep->getQuestionnaire();
        self::assertNotNull($questionnaire);
        $questionnaire->setMultipleRepliesAllowed(true);
        $proposal = (new Proposal())->setTitle('Retained proposal')->setBody('Retained body')->setProposalForm($collect->getProposalForm());
        $source->addProposal($proposal);
        $reply = (new Reply())->setQuestionnaire($questionnaire);
        $source->addReply($reply);
        $question = $this->em->getRepository(AbstractQuestion::class)->find(2);
        self::assertInstanceOf(AbstractQuestion::class, $question);
        $response = (new ValueResponse())->setQuestion($question)->setValue('Retained answer');
        $reply->addResponse($response);
        $this->em->persist($proposal);
        $this->em->persist($reply);
        $this->em->persist($response);
        $this->em->flush();
        $proposalId = $proposal->getId();
        $replyId = $reply->getId();
        $responseId = $response->getId();
        $sourceId = $source->getId();
        $targetId = $target->getId();
        if ($toUser) {
            $this->participationCookies($source);
            $this->login($targetEmail);
            $this->logout();
            $this->participationCookies($source);
            $this->login($targetEmail);
        } else {
            $result = $this->confirmPhone($source);
            self::assertNull($result['errorCode']);
            self::assertSame('PARTICIPANT_MERGED', $result['reconciliationMode']);
        }
        $this->em->clear();
        $proposal = $this->em->find(Proposal::class, $proposalId);
        $reply = $this->em->find(Reply::class, $replyId);
        $response = $this->em->find(ValueResponse::class, $responseId);
        self::assertInstanceOf(Proposal::class, $proposal);
        self::assertInstanceOf(Reply::class, $reply);
        self::assertInstanceOf(ValueResponse::class, $response);
        self::assertSame('Retained proposal', $proposal->getTitle());
        self::assertSame('Retained body', $proposal->getBody());
        self::assertSame('Retained answer', $response->getValue());
        self::assertSame($replyId, $response->getReply()->getId());
        $transferred = $matching && !$closed;
        foreach ([$proposal, $reply] as $contribution) {
            if ($transferred && $toUser) {
                self::assertNull($contribution->getParticipant());
                self::assertSame($targetId, $contribution->getAuthor()->getId());
            } else {
                self::assertSame($transferred ? $targetId : $sourceId, $contribution->getParticipant()->getId());
            }
        }
    }

    /** @return iterable<string, array{bool, bool, bool}> */
    public static function transfers(): iterable
    {
        foreach ([true, false] as $toUser) {
            yield ($toUser ? 'user' : 'participant') . ': matching email' => [$toUser, true, false];
            if ($toUser) {
                yield 'user: conflict' => [true, false, false];
                yield 'user: closed' => [true, true, true];
            }
        }
    }

    private function configure(AbstractStep $step, bool $closed): void
    {
        $step->setTimeless(false);
        $step->setStartAt(new \DateTime('2020-01-01'))->setEndAt($closed ? new \DateTime('2020-01-02') : null);
        foreach ($step->getRequirements()->toArray() as $requirement) {
            $step->removeRequirement($requirement);
        }
        $step->addRequirement((new Requirement())->setType(Requirement::EMAIL_VERIFIED)->setPosition(0));
    }
}
