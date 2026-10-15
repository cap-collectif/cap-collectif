<?php

namespace Capco\Tests\Controller\Site;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\Tests\IdentityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\BrowserKit\Cookie;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises attachment authorization over HTTP with transactional fixtures, without reading uploaded files.
 */
final class MediaResponseDownloadTest extends IdentityWebTestCase
{
    /** @var list<string> */
    private array $files = [];

    protected function tearDown(): void
    {
        try {
            foreach ($this->files as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
        } finally {
            parent::tearDown();
        }
    }

    /** @dataProvider questionnaireViewers */
    public function testQuestionnaireDownloadsFollowReplyPermissions(string $viewer, bool $privateQuestion, bool $allowed): void
    {
        $author = $this->account();
        $manager = $this->account()->addRole('ROLE_PROJECT_ADMIN');
        $participant = (new Participant())->setToken(bin2hex(random_bytes(16)));
        $questionnaire = (new Questionnaire())->setTitle('Attachment questionnaire')->setOwner($manager);
        $reply = (new Reply())->setQuestionnaire($questionnaire)->setAuthor($author)->setParticipant($participant)->setDraft(true);
        $response = $this->attachment($privateQuestion);
        $response->setReply($reply);
        foreach ([$participant, $questionnaire, $reply] as $entity) {
            $this->em->persist($entity);
        }
        $this->em->flush();

        if (\in_array($viewer, ['author', 'author with invalid cookie', 'manager', 'administrator', 'other user', 'other user with participant cookie'], true)) {
            $user = match ($viewer) {
                'author', 'author with invalid cookie' => $author,
                'manager' => $manager,
                default => $this->account(),
            };
            if ('administrator' === $viewer) {
                $user->addRole('ROLE_ADMIN');
                $this->em->flush();
            }
            $this->login($user->getEmail());
        }
        if (\in_array($viewer, ['participant', 'other user with participant cookie'], true)) {
            $this->browser->getCookieJar()->set(new Cookie('CapcoParticipant', base64_encode($participant->getToken())));
        }
        if (\in_array($viewer, ['reply cookie', 'invalid participant with reply cookie', 'other participant with reply cookie', 'different reply cookie'], true)) {
            $cookieReply = $reply;
            if ('different reply cookie' === $viewer) {
                $cookieReply = (new Reply())->setQuestionnaire($questionnaire)->setParticipant($participant);
                $this->em->persist($cookieReply);
                $this->em->flush();
            }
            $this->browser->getCookieJar()->set(new Cookie('CapcoAnonReply', base64_encode(json_encode([
                GlobalId::toGlobalId('Questionnaire', $questionnaire->getId()) => [[
                    'replyId' => GlobalId::toGlobalId('Reply', $cookieReply->getId()), 'token' => $participant->getToken(),
                ]],
            ], \JSON_THROW_ON_ERROR))));
        }
        if (\in_array($viewer, ['author with invalid cookie', 'invalid participant with reply cookie'], true)) {
            $this->browser->getCookieJar()->set(new Cookie('CapcoParticipant', 'invalid'));
        }
        if ('other participant with reply cookie' === $viewer) {
            $otherParticipant = (new Participant())->setToken(bin2hex(random_bytes(16)));
            $this->em->persist($otherParticipant);
            $this->em->flush();
            $this->browser->getCookieJar()->set(new Cookie('CapcoParticipant', base64_encode($otherParticipant->getToken())));
        }

        $this->download($response, [...$response->getMedias()][0], $allowed);
    }

    /** @return iterable<string, array{string, bool, bool}> */
    public static function questionnaireViewers(): iterable
    {
        yield 'anonymous on legacy public question' => ['anonymous', false, false];
        yield 'anonymous on private question' => ['anonymous', true, false];
        yield 'unrelated signed-in user' => ['other user', false, false];
        yield 'author of a draft' => ['author', true, true];
        yield 'questionnaire manager' => ['manager', true, true];
        yield 'administrator' => ['administrator', true, true];
        yield 'participant owns reply' => ['participant', false, true];
        yield 'exact reply cookie' => ['reply cookie', true, true];
        yield 'cookie for another reply' => ['different reply cookie', false, false];
        yield 'invalid participant cannot fall back' => ['invalid participant with reply cookie', false, false];
        yield 'other participant overrides reply cookie' => ['other participant with reply cookie', false, false];
        yield 'signed-in outsider ignores participant cookie' => ['other user with participant cookie', false, false];
        yield 'signed-in author ignores invalid participant cookie' => ['author with invalid cookie', true, true];
    }

    public function testPublicResponseCannotDownloadAnotherResponsesAttachment(): void
    {
        $publicResponse = $this->attachment(false);
        $publicResponse->setUser($this->account());
        $privateResponse = $this->attachment(true);
        $questionnaire = (new Questionnaire())->setTitle('Private attachment questionnaire');
        $reply = (new Reply())->setQuestionnaire($questionnaire);
        $privateResponse->setReply($reply);
        $this->em->persist($questionnaire);
        $this->em->persist($reply);
        $this->em->flush();

        $this->download($publicResponse, [...$publicResponse->getMedias()][0], true);
        $this->browser->request('GET', $this->url($publicResponse, [...$privateResponse->getMedias()][0]));

        self::assertResponseStatusCodeSame(404);
        self::assertFalse($this->browser->getResponse()->headers->has('Location'));
        self::assertFalse($this->browser->getResponse()->headers->has('Content-Disposition'));
    }

    /** @dataProvider proposalViewers */
    public function testProposalAttachmentPermissionsArePreserved(string $viewer, bool $privateQuestion, bool $allowed): void
    {
        $author = $this->account();
        $form = $this->em->getRepository(ProposalForm::class)->findOneBy([]);
        $proposal = (new Proposal())->setTitle('Attachment proposal')->setProposalForm($form)->setAuthor($author)->setDraft(false)->setPublishedAt(new \DateTime('2020-01-01'));
        $response = $this->attachment($privateQuestion);
        $response->setProposal($proposal);
        $this->em->persist($proposal);
        $this->em->flush();
        if ('author' === $viewer) {
            $this->login($author->getEmail());
        }

        $this->download($response, [...$response->getMedias()][0], $allowed);
    }

    /** @return iterable<string, array{string, bool, bool}> */
    public static function proposalViewers(): iterable
    {
        yield 'public proposal attachment' => ['anonymous', false, true];
        yield 'private proposal attachment denied' => ['anonymous', true, false];
        yield 'private proposal attachment author' => ['author', true, true];
    }

    private function attachment(bool $private): MediaResponse
    {
        $question = (new MediaQuestion())->setTitle('Attachment')->setPrivate($private);
        $media = (new Media())->setName('attachment.pdf')->setProviderReference(bin2hex(random_bytes(16)) . '.pdf')->setContext('default')->setContentType('application/pdf');
        $file = self::getContainer()->getParameter('kernel.project_dir') . '/public/media/default/0001/01/' . $media->getProviderReference();
        file_put_contents($file, '%PDF-synthetic attachment');
        $this->files[] = $file;
        $response = (new MediaResponse())->setQuestion($question)->addMedia($media);
        foreach ([$question, $media, $response] as $entity) {
            $this->em->persist($entity);
        }

        return $response;
    }

    private function url(MediaResponse $response, Media $media): string
    {
        return '/download/' . $response->getId() . '/media/' . $media->getId();
    }

    private function download(MediaResponse $response, Media $media, bool $allowed): void
    {
        $this->browser->request('GET', $this->url($response, $media));

        self::assertResponseStatusCodeSame($allowed ? 302 : 403);
        if ($allowed) {
            self::assertStringContainsString('/media/default/0001/01/' . $media->getProviderReference(), $this->browser->getResponse()->headers->get('Location'));
            self::assertTrue($this->browser->getResponse()->headers->hasCacheControlDirective('no-store'));
        } else {
            self::assertFalse($this->browser->getResponse()->headers->has('Location'));
            self::assertFalse($this->browser->getResponse()->headers->has('Content-Disposition'));
        }

        $this->browser->request('GET', '/media/default/0001/01/' . $media->getProviderReference());
        self::assertResponseStatusCodeSame(200);
        self::assertTrue($this->browser->getResponse()->headers->hasCacheControlDirective('no-store'));
    }
}
