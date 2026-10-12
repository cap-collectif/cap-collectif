<?php

namespace Capco\Tests\Controller\Site;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Entity\ProposalAnalyst;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\Tests\IdentityWebTestCase;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises media reuse, delivery and upload over HTTP using synthetic files and transactional data.
 */
final class MediaPrivacyTest extends IdentityWebTestCase
{
    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEElEQVR4nGP4z8AARAwQCgAf7gP9i18U1AAAAABJRU5ErkJggg==';
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

    /** @dataProvider profileMutations */
    public function testProfilesRejectPrivateAttachmentsAndAcceptPublicMedia(string $mutation, string $inputType): void
    {
        $owner = $this->account();
        $viewer = $this->account();
        $response = $this->attachment($owner);
        $media = [...$response->getMedias()][0];
        $this->login($viewer->getEmail());
        $input = ['media' => $media->getId()];
        if ('updateProfilePublicData' === $mutation) {
            $input['username'] = $viewer->getUsername();
        }
        $query = 'mutation($input:' . $inputType . '!){' . $mutation . '(input:$input){user{id media{id url}}}}';
        $result = $this->graphResponse($query, ['input' => $input]);
        self::assertStringNotContainsString($media->getProviderReference(), json_encode($result, \JSON_THROW_ON_ERROR));
        self::assertNull($this->reload($viewer->getId())->getMedia());

        $publicMedia = $this->media();
        $input['media'] = $publicMedia->getId();
        $result = $this->graphql($query, ['input' => $input]);
        self::assertSame($publicMedia->getId(), $result[$mutation]['user']['media']['id']);
        self::assertSame($publicMedia->getId(), $this->reload($viewer->getId())->getMedia()?->getId());
    }

    /** @return iterable<string, array{string, string}> */
    public static function profileMutations(): iterable
    {
        yield 'public profile' => ['updateProfilePublicData', 'UpdateProfilePublicDataInput'];
        yield 'personal profile' => ['updateProfilePersonalData', 'UpdateProfilePersonalDataInput'];
    }

    public function testLegacyAvatarCannotExposePrivateMediaMetadata(): void
    {
        $owner = $this->account();
        $viewer = $this->account();
        $media = [...$this->attachment($owner)->getMedias()][0];
        $viewer->setMedia($media);
        $this->em->flush();

        $result = $this->graphResponse('query($id:ID!){node(id:$id){...on User{media{id url name providerReference}}}}', ['id' => GlobalId::toGlobalId('User', $viewer->getId())]);
        self::assertNull($result['data']['node']['media'], json_encode($result, \JSON_THROW_ON_ERROR));
        self::assertStringNotContainsString($media->getProviderReference(), json_encode($result, \JSON_THROW_ON_ERROR));
    }

    public function testOriginalCachedImageAndGenerationRequirePermission(): void
    {
        $owner = $this->account();
        $media = [...$this->attachment($owner)->getMedias()][0];
        $relative = 'default/0001/01/' . $media->getProviderReference();
        $this->write('cache/default_avatar/' . $relative, base64_decode(self::PNG));
        $paths = ['/media/' . $relative, '/media/cache/default_avatar/' . $relative, '/media/cache/resolve/default_avatar/' . $relative];
        foreach ($paths as $path) {
            foreach (['GET', 'HEAD'] as $method) {
                $this->browser->request($method, $path);
                self::assertResponseStatusCodeSame(403);
                self::assertTrue($this->browser->getResponse()->headers->hasCacheControlDirective('no-store'));
                self::assertFalse($this->browser->getResponse()->headers->has('Location'));
            }
        }
        $this->login($owner->getEmail());
        foreach ($paths as $index => $path) {
            $this->browser->request('GET', $path);
            self::assertResponseStatusCodeSame(2 === $index ? 302 : 200);
            self::assertTrue($this->browser->getResponse()->headers->hasCacheControlDirective('no-store'));
        }
        $this->logout();
        $this->browser->request('GET', $paths[1]);
        self::assertResponseStatusCodeSame(403);
    }

    public function testPublicImageAndGeneratedThumbnailRemainReadable(): void
    {
        $media = $this->media();
        $relative = 'default/0001/01/' . $media->getProviderReference();
        $this->files[] = $this->root() . '/cache/default_avatar/' . $relative;
        $this->browser->request('GET', '/media/' . $relative);
        self::assertResponseStatusCodeSame(200);
        $response = $this->browser->getResponse();
        self::assertInstanceOf(BinaryFileResponse::class, $response);
        self::assertSame(base64_decode(self::PNG), file_get_contents($response->getFile()->getPathname()));
        $this->browser->request('GET', '/media/cache/resolve/default_avatar/' . $relative);
        self::assertResponseStatusCodeSame(302);
        $this->browser->followRedirect();
        self::assertResponseStatusCodeSame(200);
    }

    public function testRemovingReplyDoesNotPublishTheFile(): void
    {
        $response = $this->attachment($this->account());
        $media = [...$response->getMedias()][0];
        $path = '/media/default/0001/01/' . $media->getProviderReference();
        $this->em->remove($response->getReply());
        $this->em->flush();
        $this->em->clear();
        $this->browser->request('GET', $path);
        self::assertResponseStatusCodeSame(403);
    }

    /** @dataProvider analysisAttachments */
    public function testAnalysisAndHiddenAttachmentsStayConfidential(string $source, bool $legacy): void
    {
        $owner = $this->account();
        $analyst = $this->account();
        $proposal = (new Proposal())->setTitle('Analysis attachment')->setProposalForm($this->em->getRepository(ProposalForm::class)->findOneBy([]))->setAuthor($owner)->setDraft(false)->setPublishedAt(new \DateTime('2020-01-01'));
        $assignment = new ProposalAnalyst($proposal, $analyst);
        $proposal->addProposalAnalyst($assignment);
        $question = (new MediaQuestion())->setTitle('Internal attachment')->setPrivate(false);
        $media = $this->media();
        $public = $this->media();
        $response = (new MediaResponse())->setQuestion($question)->addMedia($media);
        if ('analysis' === $source) {
            $analysis = (new ProposalAnalysis())->setProposal($proposal)->setUpdatedBy($owner);
            $response->setAnalysis($analysis);
            $this->em->persist($analysis);
        } else {
            $response->setProposal($proposal);
        }
        foreach ([$proposal, $assignment, $question, $response] as $entity) {
            $this->em->persist($entity);
        }
        $this->em->flush();
        if ('hidden' === $source) {
            $question->setHidden(true);
            $this->em->flush();
        }
        if ($legacy) {
            $media->setProviderMetadata(['filename' => 'existing.png']);
            $this->em->flush();

            require_once __DIR__ . '/../../../src/DoctrineMigrations/Version20261009180000.php';
            $migration = new \Application\Migrations\Version20261009180000($this->em->getConnection(), new \Psr\Log\NullLogger());
            $migration->up(new \Doctrine\DBAL\Schema\Schema());
            foreach ($migration->getSql() as $query) {
                $this->em->getConnection()->executeStatement($query->getStatement(), $query->getParameters(), $query->getTypes());
            }
        }
        $mediaId = $media->getId();
        $responseId = $response->getId();
        $relative = 'default/0001/01/' . $media->getProviderReference();
        $this->write('cache/default_avatar/' . $relative, base64_decode(self::PNG));
        $this->em->clear();
        $media = $this->em->find(Media::class, $mediaId);
        self::assertSame('1', $media->getMetadataValue('private_attachment'));
        self::assertNull($this->em->find(Media::class, $public->getId())->getMetadataValue('private_attachment'));
        if ($legacy) {
            self::assertSame('existing.png', $media->getMetadataValue('filename'));
        }
        $admin = $this->account()->addRole('ROLE_ADMIN');
        $this->em->flush();
        foreach ([null, $owner, $this->account(), $analyst, $admin] as $viewer) {
            if ($viewer) {
                $this->login($viewer->getEmail());
            }
            $allowed = $viewer === $analyst || $viewer === $admin;
            foreach (['/media/' . $relative => 200, '/media/cache/default_avatar/' . $relative => 200, '/media/cache/resolve/default_avatar/' . $relative => 302, '/download/' . $responseId . '/media/' . $mediaId => 302] as $path => $status) {
                $this->browser->request('GET', $path);
                self::assertResponseStatusCodeSame($allowed ? $status : 403);
                self::assertTrue($this->browser->getResponse()->headers->hasCacheControlDirective('no-store'));
            }
            if ($viewer) {
                $this->logout();
            }
        }
        $response = $this->em->find(MediaResponse::class, $responseId);
        $this->em->remove($response->getAnalysis() ?? $response);
        $this->em->flush();
        $this->em->clear();
        $this->browser->request('GET', '/media/' . $relative);
        self::assertResponseStatusCodeSame(403);
    }

    /** @return iterable<string, array{string, bool}> */
    public static function analysisAttachments(): iterable
    {
        yield 'new analysis attachment' => ['analysis', false];
        yield 'legacy analysis attachment' => ['analysis', true];
        yield 'question becomes hidden' => ['hidden', false];
        yield 'legacy hidden attachment' => ['hidden', true];
    }

    public function testRejectedMediaSelectionCannotBeFlushedByAnotherMutation(): void
    {
        $owner = $this->account();
        $viewer = $this->account();
        $questionnaire = (new Questionnaire())->setTitle('Private files')->setOwner($owner);
        $step = (new QuestionnaireStep())->setTitle('Files')->setLabel('Files');
        $step->setQuestionnaire($questionnaire);
        $this->em->persist($step);
        $question = (new MediaQuestion())->setTitle('Attachment')->setPrivate(false)->setRequired(false);
        $association = (new QuestionnaireAbstractQuestion())->setQuestionnaire($questionnaire)->setQuestion($question)->setPosition(1);
        $questionnaire->addQuestion($association);
        $private = $this->media();
        $own = $this->media();
        $ownerReply = (new Reply())->setQuestionnaire($questionnaire)->setAuthor($owner)->setDraft(false);
        $ownReply = (new Reply())->setQuestionnaire($questionnaire)->setAuthor($viewer)->setDraft(false);
        $ownerResponse = (new MediaResponse())->setQuestion($question)->addMedia($private);
        $ownResponse = (new MediaResponse())->setQuestion($question)->addMedia($own);
        $ownerReply->addResponse($ownerResponse);
        $ownReply->addResponse($ownResponse);
        foreach ([$questionnaire, $question, $association, $ownerReply, $ownReply, $ownerResponse, $ownResponse] as $entity) {
            $this->em->persist($entity);
        }
        $this->em->flush();
        $responseId = $ownResponse->getId();
        $privatePath = '/media/default/0001/01/' . $private->getProviderReference();
        $this->login($viewer->getEmail());
        $this->browser->request('GET', $privatePath);
        self::assertResponseStatusCodeSame(403);

        $query = 'mutation($reply:UpdateUserReplyInput!,$profile:UpdateProfilePublicDataInput!){first:updateUserReply(input:$reply){reply{id}} second:updateProfilePublicData(input:$profile){user{id}}}';
        $variables = [
            'reply' => [
                'replyId' => GlobalId::toGlobalId('Reply', $ownReply->getId()),
                'draft' => true,
                'responses' => [['question' => GlobalId::toGlobalId('Question', $question->getId()), 'medias' => [$private->getId()]]],
            ],
            'profile' => ['username' => $viewer->getUsername()],
        ];
        $result = $this->graphResponse($query, $variables);
        self::assertSame(['first'], $result['errors'][0]['path']);
        self::assertSame(GlobalId::toGlobalId('User', $viewer->getId()), $result['data']['second']['user']['id']);
        $this->em->clear();
        $stored = $this->em->find(MediaResponse::class, $responseId);
        self::assertSame([$own->getId()], array_map(static fn (Media $media) => $media->getId(), [...$stored->getMedias()]));
        $this->browser->request('GET', $privatePath);
        self::assertResponseStatusCodeSame(403);

        $public = $this->media();
        $variables['reply']['responses'][0]['medias'] = [$own->getId(), $public->getId()];
        $this->graphql($query, $variables);
        $this->em->clear();
        $stored = $this->em->find(MediaResponse::class, $responseId);
        self::assertEqualsCanonicalizing([$own->getId(), $public->getId()], array_map(static fn (Media $media) => $media->getId(), [...$stored->getMedias()]));
    }

    /** @dataProvider privateAttachmentRemovalModes */
    public function testPrivatizingAQuestionProtectsItsRemovedAttachments(string $mode): void
    {
        $author = $this->account();
        $author->addRole('ROLE_ADMIN');
        $form = (new ProposalForm())->setTitle('Private files')->setOwner($author);
        $proposal = (new Proposal())->setTitle('Private transition')->setProposalForm($form)->setAuthor($author)->setDraft(false);
        $question = (new MediaQuestion())->setTitle('Attachment')->setPrivate(false);
        $association = (new QuestionnaireAbstractQuestion())->setProposalForm($form)->setQuestion($question)->setPosition(1);
        $form->addQuestion($association);
        $media = $this->media();
        $response = (new MediaResponse())->setQuestion($question)->setProposal($proposal)->addMedia($media);
        foreach ([$form, $association, $proposal, $question, $response] as $entity) {
            $this->em->persist($entity);
        }
        $this->em->flush();
        $responseId = $response->getId();
        $questionId = $question->getId();
        $path = '/media/default/0001/01/' . $media->getProviderReference();
        $this->browser->request('GET', $path);
        self::assertResponseStatusCodeSame(200);

        $this->em->clear();
        if ('later' === $mode) {
            $this->login($author->getEmail());
            $this->graphql('mutation($input:UpdateProposalFormInput!){updateProposalForm(input:$input){proposalForm{id}}}', ['input' => [
                'proposalFormId' => $form->getId(),
                'questions' => [['question' => ['id' => GlobalId::toGlobalId('Question', $questionId), 'title' => 'Attachment', 'type' => 'medias', 'private' => true]]],
            ]]);
            $this->logout();
            $this->em->clear();
            self::assertSame('1', $this->em->find(Media::class, $media->getId())->getMetadataValue('private_attachment'));
            $this->browser->request('GET', $path);
            self::assertResponseStatusCodeSame(403);
        } else {
            $this->em->find(MediaQuestion::class, $questionId)->setPrivate(true);
        }
        $response = $this->em->find(MediaResponse::class, $responseId);
        if ('clear' === $mode) {
            $response->getMedias()->clear();
        } else {
            $response->setMedias(new ArrayCollection());
        }
        $this->em->flush();
        $this->em->clear();
        self::assertCount(0, $this->em->find(MediaResponse::class, $responseId)->getMedias());
        $this->browser->request('GET', $path);
        self::assertResponseStatusCodeSame(403);
    }

    /** @return iterable<string, array{string}> */
    public static function privateAttachmentRemovalModes(): iterable
    {
        yield 'removed in a later flush' => ['later'];
        yield 'replaced during the privacy change' => ['replace'];
        yield 'cleared during the privacy change' => ['clear'];
    }

    public function testUnregisteredFileIsNotServed(): void
    {
        $relative = 'default/0001/01/' . bin2hex(random_bytes(16)) . '.png';
        $this->write($relative, base64_decode(self::PNG));
        $this->browser->request('GET', '/media/' . $relative);
        self::assertResponseStatusCodeSame(404);
    }

    public function testMigrationProtectsLegacyAttachmentsAndKeepsOtherMetadata(): void
    {
        $owner = $this->account();
        $media = [...$this->attachment($owner)->getMedias()][0];
        $emptyMetadataMedia = [...$this->attachment($owner)->getMedias()][0];
        $public = $this->media();
        $media->setProviderMetadata(['filename' => 'existing.png']);
        $emptyMetadataMedia->setProviderMetadata([]);
        $this->em->flush();

        require_once __DIR__ . '/../../../src/DoctrineMigrations/Version20261009120000.php';
        $migration = new \Application\Migrations\Version20261009120000($this->em->getConnection(), new \Psr\Log\NullLogger());
        $migration->up(new \Doctrine\DBAL\Schema\Schema());
        foreach ($migration->getSql() as $query) {
            $this->em->getConnection()->executeStatement($query->getStatement(), $query->getParameters(), $query->getTypes());
        }
        $this->em->refresh($media);
        $this->em->refresh($emptyMetadataMedia);
        $this->em->refresh($public);
        self::assertSame('1', $media->getMetadataValue('private_attachment'));
        self::assertSame('1', $emptyMetadataMedia->getMetadataValue('private_attachment'));
        self::assertSame('existing.png', $media->getMetadataValue('filename'));
        self::assertNull($public->getMetadataValue('private_attachment'));
    }

    public function testCropCannotReadAnotherUsersAttachment(): void
    {
        $media = [...$this->attachment($this->account())->getMedias()][0];
        $this->login($this->account()->getEmail());
        $result = $this->graphResponse('mutation($input:CropMediaInput!){cropMedia(input:$input){media{id url}}}', ['input' => [
            'mediaId' => $media->getId(), 'filters' => ['size' => ['width' => 1, 'height' => 1], 'start' => ['x' => 0, 'y' => 0]],
        ]]);
        self::assertSame('Access denied to this field.', $result['errors'][0]['message']);
        self::assertFileDoesNotExist($this->root() . '/cache/cropped_media/default/0001/01/' . $media->getProviderReference());
    }

    public function testUploadDoesNotReuseAMatchingConfidentialFile(): void
    {
        $media = [...$this->attachment($this->account())->getMedias()][0];
        $file = tempnam(sys_get_temp_dir(), 'media-privacy-');
        self::assertIsString($file);
        $this->files[] = $file;
        file_put_contents($file, base64_decode(self::PNG));
        $this->setFeature('antivirus', false);
        $this->browser->request('POST', '/api/files', [], ['file' => new UploadedFile($file, $media->getName(), 'image/png', null, true)]);
        self::assertResponseStatusCodeSame(201);
        $uploaded = json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
        $newMedia = $this->em->find(Media::class, $uploaded['id']);
        $this->files[] = $this->root() . '/default/0001/01/' . $newMedia->getProviderReference();
        self::assertNotSame($media->getId(), $newMedia->getId());
        self::assertNotSame($media->getProviderReference(), $newMedia->getProviderReference());
        $this->browser->request('GET', $uploaded['url']);
        self::assertResponseStatusCodeSame(200);
    }

    public function testClearingLegacyAvatarDoesNotDeleteItsPrivateAttachment(): void
    {
        $owner = $this->account();
        $viewer = $this->account();
        $media = [...$this->attachment($owner)->getMedias()][0];
        $id = $media->getId();
        $file = $this->root() . '/default/0001/01/' . $media->getProviderReference();
        $viewer->setMedia($media);
        $this->em->flush();
        $this->login($viewer->getEmail());
        $this->graphql('mutation($input:UpdateProfilePublicDataInput!){updateProfilePublicData(input:$input){user{id}}}', ['input' => [
            'username' => $viewer->getUsername(), 'media' => null,
        ]]);
        self::assertNull($this->reload($viewer->getId())->getMedia());
        self::assertNotNull($this->em->find(Media::class, $id));
        self::assertFileExists($file);
    }

    public function testProposalIllustrationRejectsAnotherAuthorsAttachment(): void
    {
        $media = [...$this->attachment($this->account())->getMedias()][0];
        $viewer = $this->account();
        $form = $this->em->getRepository(ProposalForm::class)->findOneBy([]);
        $proposal = (new Proposal())->setTitle('Media access')->setProposalForm($form)->setAuthor($viewer)->setDraft(false);
        $this->em->persist($proposal);
        $this->em->flush();
        $this->login($viewer->getEmail());
        $query = 'mutation($input:UpdateProposalIllustrationInput!){updateProposalIllustration(input:$input){errorCode proposal{id media{id}}}}';
        $input = ['proposalId' => GlobalId::toGlobalId('Proposal', $proposal->getId()), 'media' => $media->getId()];
        $result = $this->graphql($query, ['input' => $input]);
        self::assertSame('ACCESS_DENIED', $result['updateProposalIllustration']['errorCode']);
        $this->em->clear();
        $proposal = $this->em->find(Proposal::class, $proposal->getId());
        self::assertNull($proposal->getMedia());

        $publicMedia = $this->media();
        $input['media'] = $publicMedia->getId();
        $result = $this->graphql($query, ['input' => $input]);
        self::assertNull($result['updateProposalIllustration']['errorCode']);
        $this->em->clear();
        $proposal = $this->em->find(Proposal::class, $proposal->getId());
        self::assertSame($publicMedia->getId(), $proposal->getMedia()?->getId());
    }

    private function attachment(User $owner): MediaResponse
    {
        $questionnaire = (new Questionnaire())->setTitle('Private files')->setOwner($owner);
        $reply = (new Reply())->setQuestionnaire($questionnaire)->setAuthor($owner);
        $question = (new MediaQuestion())->setTitle('Document')->setPrivate(false);
        $response = (new MediaResponse())->setQuestion($question)->setReply($reply)->addMedia($this->media());
        foreach ([$questionnaire, $reply, $question, $response] as $entity) {
            $this->em->persist($entity);
        }
        $this->em->flush();

        return $response;
    }

    private function media(): Media
    {
        $media = (new Media())->setName('synthetic-private.png')->setProviderReference(bin2hex(random_bytes(16)) . '.png')->setContext('default')->setContentType('image/png')->setSize(\strlen(base64_decode(self::PNG)));
        $this->write('default/0001/01/' . $media->getProviderReference(), base64_decode(self::PNG));
        $this->em->persist($media);
        $this->em->flush();

        return $media;
    }

    private function root(): string
    {
        return self::getContainer()->getParameter('kernel.project_dir') . '/public/media';
    }

    private function write(string $path, string $contents): void
    {
        $file = $this->root() . '/' . $path;
        if (!is_dir(\dirname($file))) {
            mkdir(\dirname($file), 0775, true);
        }
        file_put_contents($file, $contents);
        $this->files[] = $file;
    }
}
