<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Entity\Interfaces\ContributionInterface;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\GraphQL\Mutation\SendParticipantEmailWorkflowMutation;
use Capco\AppBundle\Service\ParticipationWorkflow\ConfirmationParticipationParticipantEmailSender;
use Capco\AppBundle\Service\ParticipationWorkflow\MagicLinkEmailSender;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class SendParticipantEmailWorkflowMutationTest extends TestCase
{
    private UserRepository $userRepository;

    private MagicLinkEmailSender $magicLinkEmailSender;
    private ConfirmationParticipationParticipantEmailSender $confirmationParticipationParticipantEmailSender;

    private SendParticipantEmailWorkflowMutation $sendParticipantEmailWorkflowMutation;

    protected function setUp(): void
    {
        $this->userRepository = $this->createMock(UserRepository::class);
        $this->magicLinkEmailSender = $this->createMock(MagicLinkEmailSender::class);
        $this->confirmationParticipationParticipantEmailSender = $this->createMock(ConfirmationParticipationParticipantEmailSender::class);

        $this->sendParticipantEmailWorkflowMutation = new SendParticipantEmailWorkflowMutation(
            $this->userRepository,
            $this->magicLinkEmailSender,
            $this->confirmationParticipationParticipantEmailSender,
        );
    }

    public function testMagicLinkPath(): void
    {
        $email = 'test@example.com';
        $redirectUrl = 'http://example.com';
        $participantToken = 'test-token';

        $argument = new Argument([
            'input' => [
                'participantToken' => $participantToken,
                'email' => $email,
                'redirectUrl' => $redirectUrl,
                'contributionId' => 'contribution-id',
                'emailType' => 'MAGIC_LINK',
            ],
        ]);

        $this->setUpContribution();

        $user = $this->createMock(User::class);
        $user->method('getEmail')->willReturn($email);
        $this->userRepository->method('findOneBy')->willReturn($user);

        $this->magicLinkEmailSender->expects($this->once())
            ->method('send')
            ->with($email, $redirectUrl)
            ->willReturn(['errorCode' => null, 'confirmationUrl' => ''])
        ;

        $this->sendParticipantEmailWorkflowMutation->__invoke($argument);
    }

    public function testSendParticipationConfirmationEmailPath(): void
    {
        $email = 'test@example.com';
        $redirectUrl = 'http://example.com';
        $participantToken = 'test-token';

        $argument = new Argument([
            'input' => [
                'participantToken' => $participantToken,
                'email' => $email,
                'redirectUrl' => $redirectUrl,
                'contributionId' => 'contribution-id',
                'emailType' => 'PARTICIPANT_CONFIRMATION_EMAIL',
            ],
        ]);

        $this->setUpContribution();

        $this->userRepository->method('findOneBy')->willReturn(null);

        $this->confirmationParticipationParticipantEmailSender->expects($this->once())
            ->method('send')
            ->with($participantToken, $email, $redirectUrl)
            ->willReturn(['errorCode' => null, 'confirmationUrl' => ''])
        ;

        $this->sendParticipantEmailWorkflowMutation->__invoke($argument);
    }

    /**
     * @return array{'questionnaire': Questionnaire&MockObject}
     */
    private function setUpContribution(): array
    {
        $step = $this->createMock(QuestionnaireStep::class);
        $questionnaire = $this->createMock(Questionnaire::class);
        $questionnaire->method('isMultipleRepliesAllowed')->willReturn(false);
        $step->method('getQuestionnaire')->willReturn($questionnaire);

        $contribution = $this->createMock(ContributionInterface::class);
        $contribution->method('getStep')->willReturn($step);

        return ['questionnaire' => $questionnaire];
    }
}
