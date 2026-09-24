<?php

namespace Capco\Tests\Service;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Service\CapcoAnonReplyDecoder;
use Capco\AppBundle\Service\ParticipantAccessResolver;
use Capco\AppBundle\Service\ParticipantHelper;
use PHPUnit\Framework\TestCase;

/**
 * @covers \Capco\AppBundle\Service\ParticipantAccessResolver
 *
 * @internal
 */
class ParticipantAccessResolverTest extends TestCase
{
    public function testItAllowsAReplyWithMissingRequirementsForItsParticipant(): void
    {
        $participant = $this->createMock(Participant::class);
        $participant->method('getId')->willReturn('participant');

        $questionnaire = $this->createMock(Questionnaire::class);
        $questionnaire->method('getId')->willReturn('questionnaire');

        $reply = $this->createMock(Reply::class);
        $reply->method('getQuestionnaire')->willReturn($questionnaire);
        $reply->method('getId')->willReturn('reply');
        $reply->method('getParticipant')->willReturn($participant);

        $participantHelper = $this->createMock(ParticipantHelper::class);
        $participantHelper->expects($this->once())->method('getParticipantByToken')->with('token')->willReturn($participant);

        $decoder = $this->createMock(CapcoAnonReplyDecoder::class);
        $decoder->expects($this->once())->method('decode')->with('cookie')->willReturn([
            'questionnaire' => [['replyId' => 'reply', 'token' => 'token']],
        ]);

        $resolver = new ParticipantAccessResolver($participantHelper, $decoder);

        self::assertTrue($resolver->canViewReplyFromCookie($reply, 'cookie'));
    }
}
