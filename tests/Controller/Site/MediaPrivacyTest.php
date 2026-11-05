<?php

namespace Capco\Tests\Controller\Site;

use Application\Migrations\Version20261009120000;
use Application\Migrations\Version20261009180000;
use Capco\AppBundle\DBAL\Enum\EventReviewStatusType;
use Capco\AppBundle\Entity\District\GlobalDistrict;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventReview;
use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Page;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Entity\ProposalAnalyst;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\PublicApiToken;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\Tests\IdentityWebTestCase;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\DBAL\Schema\Schema;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Psr\Log\NullLogger;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;

/**
 * @internal
 *
 * @runTestsInSeparateProcesses
 *
 * @preserveGlobalState disabled
 *
 * @phpunit-status compliant
 *
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

    /** @return array<string, bool> */
    public static function featureFlagOverrides(): array
    {
        return ['private_media_read_enforcement' => true];
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

    public function testLegacyAvatarDoesNotExposePrivateMediaMetadata(): void
    {
        $owner = $this->account();
        $viewer = $this->account();
        $media = [...$this->attachment($owner)->getMedias()][0];
        // Seed a historical association that new writes now reject.
        $this->em->getConnection()->update($this->em->getClassMetadata(User::class)->getTableName(), ['media_id' => $media->getId()], ['id' => $viewer->getId()]);
        $this->em->refresh($viewer);

        $result = $this->graphResponse('query($id:ID!){node(id:$id){...on User{media{id url name providerReference}}}}', ['id' => GlobalId::toGlobalId('User', $viewer->getId())]);
        self::assertSame('Access denied to this field.', $result['extensions']['warnings'][0]['message']);
        self::assertSame(['node', 'media', 'id'], $result['extensions']['warnings'][0]['path']);
        self::assertNull($result['data']['node']['media']);
    }

    /** @dataProvider shieldModes */
    public function testPrivateAttachmentsRequireAuthorizationByDirectUrl(bool $shield): void
    {
        $this->setFeature('shield_mode', $shield);
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
        foreach ([false, true, false] as $enforce) {
            $this->setFeatureFlags(['private_media_read_enforcement' => $enforce]);
            foreach ($paths as $index => $path) {
                foreach (['GET', 'HEAD'] as $method) {
                    $this->browser->request($method, $path);
                    self::assertResponseStatusCodeSame($enforce ? 403 : (2 === $index ? 302 : 200));
                    self::assertTrue($this->browser->getResponse()->headers->hasCacheControlDirective('no-store'));
                }
            }
        }
        $this->login($owner->getEmail());
        foreach ([true, false] as $enforce) {
            $this->setFeatureFlags(['private_media_read_enforcement' => $enforce]);
            foreach ($paths as $index => $path) {
                $this->browser->request('GET', $path);
                self::assertResponseStatusCodeSame(2 === $index ? 302 : 200);
                self::assertTrue($this->browser->getResponse()->headers->hasCacheControlDirective('no-store'));
            }
        }
        $this->setFeatureFlags(['private_media_read_enforcement' => true]);
        $this->logout();
        $this->browser->request('GET', $paths[1]);
        self::assertResponseStatusCodeSame(403);
    }

    /** @return iterable<string, array{bool}> */
    public static function shieldModes(): iterable
    {
        yield 'without shield' => [false];

        yield 'with shield' => [true];
    }

    /** @dataProvider publicReadModes */
    public function testVoiceMessagesRemainProtected(bool $shield, bool $enforce): void
    {
        $this->setFeatureFlags(['shield_mode' => $shield, 'private_media_read_enforcement' => $enforce]);
        $media = (new Media())->setName('private.webm')->setProviderReference(bin2hex(random_bytes(16)) . '.webm')->setContext(Media::VOCAL_CONTRIBUTION_CONTEXT)->setContentType('audio/webm')->setSize(13);
        $this->em->persist($media);
        $this->em->flush();
        $relative = Media::VOCAL_CONTRIBUTION_CONTEXT . '/0001/01/' . $media->getProviderReference();
        $this->write($relative, 'private audio');
        $this->write('cache/default_avatar/' . $relative, 'private audio');
        foreach ([null, $this->account()] as $viewer) {
            if ($viewer) {
                $this->login($viewer->getEmail());
            }
            foreach (['/media/' . $relative, '/media/cache/default_avatar/' . $relative, '/media/cache/resolve/default_avatar/' . $relative] as $path) {
                foreach (['GET', 'HEAD'] as $method) {
                    $this->browser->request($method, $path);
                    self::assertResponseStatusCodeSame(403);
                    self::assertTrue($this->browser->getResponse()->headers->hasCacheControlDirective('no-store'));
                }
            }
        }
        $this->logout();
        $admin = $this->account()->addRole('ROLE_ADMIN');
        $this->em->flush();
        $this->login($admin->getEmail());
        $this->browser->request('GET', '/media/' . $relative);
        self::assertResponseStatusCodeSame(200);
        $response = $this->browser->getResponse();
        self::assertInstanceOf(BinaryFileResponse::class, $response);
        self::assertSame('private audio', file_get_contents($response->getFile()->getPathname()));
    }

    /** @dataProvider publicReadModes */
    public function testPublicImageAndGeneratedThumbnailRemainReadable(bool $shield, bool $enforce): void
    {
        $this->setFeatureFlags(['private_media_read_enforcement' => $enforce]);
        $this->setFeature('shield_mode', $shield);
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

    /** @return iterable<string, array{bool, bool}> */
    public static function publicReadModes(): iterable
    {
        foreach ([false, true] as $shield) {
            foreach ([false, true] as $enforce) {
                yield sprintf('shield %d enforcement %d', $shield, $enforce) => [$shield, $enforce];
            }
        }
    }

    public function testRemovingReplyKeepsItsAttachmentsPrivate(): void
    {
        $response = $this->attachment($this->account());
        $media = [...$response->getMedias()][0];
        $path = '/media/default/0001/01/' . $media->getProviderReference();
        $mediaId = $media->getId();
        $this->em->remove($response->getReply());
        $this->em->flush();
        $this->em->clear();
        $this->browser->request('GET', $path);
        self::assertResponseStatusCodeSame(403);
        self::assertSame('1', $this->em->find(Media::class, $mediaId)->getMetadataValue('private_attachment'));
    }

    /** @dataProvider analysisAttachments */
    public function testAnalysisAndHiddenAttachmentsRequireAuthorization(string $source, bool $legacy): void
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
            $media->setMetadataValue('private_attachment', '1');
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
            $migration = new Version20261009180000($this->em->getConnection(), new NullLogger());
            $migration->up(new Schema());
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
        $private->setMetadataValue('private_attachment', '1');
        $own->setMetadataValue('private_attachment', '1');
        $ownerResponse = (new MediaResponse())->setQuestion($question)->addMedia($private);
        $ownResponse = (new MediaResponse())->setQuestion($question)->addMedia($own);
        $ownerReply->addResponse($ownerResponse);
        $ownReply->addResponse($ownResponse);
        foreach ([$questionnaire, $question, $association, $ownerReply, $ownReply, $ownerResponse, $ownResponse] as $entity) {
            $this->em->persist($entity);
        }
        $this->em->flush();
        $responseId = $ownResponse->getId();
        $privatePath = '/download/' . $ownerResponse->getId() . '/media/' . $private->getId();
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

        $file = tempnam(sys_get_temp_dir(), 'private-attachment-');
        self::assertIsString($file);
        $this->files[] = $file;
        file_put_contents($file, base64_decode(self::PNG));
        $this->setFeature('antivirus', false);
        $this->browser->request('POST', '/api/files', ['questionId' => GlobalId::toGlobalId('Question', $question->getId())], ['file' => new UploadedFile($file, 'attachment.png', 'image/png', null, true)]);
        self::assertResponseStatusCodeSame(201);
        $uploaded = json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
        $newPrivate = $this->em->find(Media::class, $uploaded['id']);
        $this->files[] = $this->root() . '/default/0001/01/' . $newPrivate->getProviderReference();
        self::assertSame('1', $newPrivate->getMetadataValue('private_attachment'));
        $variables['reply']['responses'][0]['medias'] = [$own->getId(), $newPrivate->getId()];
        $this->graphql($query, $variables);
        $this->em->clear();
        $stored = $this->em->find(MediaResponse::class, $responseId);
        self::assertEqualsCanonicalizing([$own->getId(), $newPrivate->getId()], array_map(static fn (Media $media) => $media->getId(), [...$stored->getMedias()]));
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

    /** @dataProvider enforcementModes */
    public function testUnregisteredFileIsNotServed(bool $enforce): void
    {
        $this->setFeatureFlags(['private_media_read_enforcement' => $enforce]);
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
        $migration = new Version20261009120000($this->em->getConnection(), new NullLogger());
        $migration->up(new Schema());
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
        // Seed a historical association that new writes now reject.
        $this->em->getConnection()->update($this->em->getClassMetadata(User::class)->getTableName(), ['media_id' => $media->getId()], ['id' => $viewer->getId()]);
        $this->em->refresh($viewer);
        $this->login($viewer->getEmail());
        $this->graphql('mutation($input:UpdateProfilePublicDataInput!){updateProfilePublicData(input:$input){user{id}}}', ['input' => [
            'username' => $viewer->getUsername(), 'media' => null,
        ]]);
        self::assertNull($this->reload($viewer->getId())->getMedia());
        self::assertNotNull($this->em->find(Media::class, $id));
        self::assertFileExists($file);
    }

    /** @dataProvider enforcementModes */
    public function testProposalIllustrationRejectsAnotherAuthorsAttachment(bool $enforce): void
    {
        $this->setFeatureFlags(['private_media_read_enforcement' => $enforce]);
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

    /** @return iterable<string, array{bool}> */
    public static function enforcementModes(): iterable
    {
        yield 'enforced' => [true];

        yield 'bypassed' => [false];
    }

    public function testProposalCoverDoesNotGrantAccessToPrivateMedia(): void
    {
        $owner = $this->account();
        $public = $this->media();
        $proposal = (new Proposal())->setTitle('Public cover')->setProposalForm($this->em->getRepository(ProposalForm::class)->findOneBy([]))->setAuthor($owner)->setDraft(false)->setPublishedAt(new \DateTime('2020-01-01'))->setMedia($public);
        $this->em->persist($proposal);
        $this->em->flush();
        $id = $proposal->getId();
        $query = 'query($id:ID!){node(id:$id){...on Proposal{media{id url}}}}';
        $variables = ['id' => GlobalId::toGlobalId('Proposal', $id)];

        $result = $this->graphql($query, $variables);
        self::assertSame($public->getId(), $result['node']['media']['id']);
        $this->browser->request('GET', $result['node']['media']['url']);
        self::assertResponseStatusCodeSame(200);

        $this->login($owner->getEmail());
        $owner = $this->em->find(User::class, $owner->getId());
        $public = $this->em->find(Media::class, $public->getId());
        $attachment = $this->attachment($owner, $public);
        $this->logout();
        self::assertSame('1', $public->getMetadataValue('private_attachment'));
        $this->em->clear();

        $result = $this->graphResponse($query, $variables);
        self::assertSame('Access denied to this field.', $result['extensions']['warnings'][0]['message']);
        self::assertNull($result['data']['node']['media']);
        $this->browser->request('GET', '/media/default/0001/01/' . $public->getProviderReference());
        self::assertResponseStatusCodeSame(403);

        $this->browser->request('GET', '/download/' . $attachment->getId() . '/media/' . $public->getId());
        self::assertResponseStatusCodeSame(403);
        self::assertSame('1', $this->em->find(Media::class, $public->getId())->getMetadataValue('private_attachment'));
    }

    public function testAdminCannotReusePrivateMediaAsProjectCover(): void
    {
        $admin = $this->account()->addRole('ROLE_ADMIN');
        $media = [...$this->attachment($admin)->getMedias()][0];
        $project = $this->em->getRepository(Project::class)->findOneBy(['visibility' => 2]);
        $id = $project->getId();
        $previousCover = $project->getCover()?->getId();
        $this->login($admin->getEmail());
        $result = $this->graphResponse('mutation($input:UpdateProjectInput!){updateProject(input:$input){project{id}}}', ['input' => [
            'id' => GlobalId::toGlobalId('Project', $id),
            'authors' => [GlobalId::toGlobalId('User', $admin->getId())],
            'cover' => $media->getId(),
        ]]);
        self::assertSame('MEDIA_REUSE_DENIED', $result['errors'][0]['extensions']['code']);
        self::assertSame('cover', $result['errors'][0]['extensions']['field']);
        $this->em->clear();
        self::assertSame($previousCover, $this->em->find(Project::class, $id)->getCover()?->getId());
        self::assertSame('1', $this->em->find(Media::class, $media->getId())->getMetadataValue('private_attachment'));
    }

    /** @dataProvider privatePublicHtml */
    public function testPublicProposalRejectsPrivateWysiwygWithoutPersistingIt(string $markup, bool $draft): void
    {
        $owner = $this->account();
        $media = [...$this->attachment($owner)->getMedias()][0];
        $form = $this->em->find(ProposalForm::class, 'proposalForm4');
        $form->setUsingDescription(true);
        $form->getStep()->setEndAt(new \DateTime('+1 year'));
        $form->getStep()->setPrivate(false);
        $form->getStep()->getProject()->setVisibility(2);
        $body = sprintf($markup, '/media/default/0001/01/' . $media->getProviderReference());
        $proposal = (new Proposal())->setTitle('Private reuse rejected')->setProposalForm($form)->setAuthor($owner)->setDraft($draft)->setBody($draft ? $body : '<p>Original</p>')->setPublishedAt(new \DateTime('-1 day'));
        $this->em->persist($proposal);
        $this->em->flush();
        $id = $proposal->getId();
        $previousBody = $proposal->getBody();
        $this->login($owner->getEmail());
        $result = $this->graphResponse('mutation($input:ChangeProposalContentInput!){changeProposalContent(input:$input){proposal{id}}}', ['input' => [
            'id' => GlobalId::toGlobalId('Proposal', $id), 'title' => $proposal->getTitle(), 'draft' => false, 'body' => $body,
        ]]);
        self::assertSame('MEDIA_REUSE_DENIED', $result['errors'][0]['extensions']['code']);
        self::assertSame('body', $result['errors'][0]['extensions']['field']);
        $this->em->clear();
        self::assertSame($previousBody, $this->em->find(Proposal::class, $id)->getBody());
        self::assertSame($draft, $this->em->find(Proposal::class, $id)->isDraft());
        self::assertSame('1', $this->em->find(Media::class, $media->getId())->getMetadataValue('private_attachment'));
    }

    /** @return iterable<string, array{string, bool}> */
    public static function privatePublicHtml(): iterable
    {
        yield 'image' => ['<img src="%s">', false];

        yield 'link' => ['<a href="%s">download</a>', false];

        yield 'greater than in attribute' => ['<img title=">" src="%s">', false];

        yield 'draft publication' => ['<img src="%s">', true];
    }

    public function testPrivateEditorUploadIsProtectedBeforeSubmission(): void
    {
        $owner = $this->account();
        $question = (new SimpleQuestion())->setTitle('Private editor')->setType(2)->setPrivate(true);
        $this->em->persist($question);
        $this->em->flush();
        $this->login($owner->getEmail());
        $file = tempnam(sys_get_temp_dir(), 'media-privacy-upload-');
        self::assertIsString($file);
        $this->files[] = $file;
        file_put_contents($file, base64_decode(self::PNG));
        $this->setFeature('antivirus', false);
        $this->browser->request('POST', '/api/files', ['questionId' => GlobalId::toGlobalId('Question', $question->getId())], ['file' => new UploadedFile($file, 'private.png', 'image/png', null, true)]);
        self::assertResponseStatusCodeSame(201);
        $uploaded = json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
        $media = $this->em->find(Media::class, $uploaded['id']);
        $this->files[] = $this->root() . '/default/0001/01/' . $media->getProviderReference();
        self::assertSame('1', $media->getMetadataValue('private_attachment'));
        $this->browser->request('GET', $uploaded['url']);
        self::assertResponseStatusCodeSame(200);
        $this->logout();
        $this->browser->getCookieJar()->clear();
        $this->browser->request('GET', $uploaded['url']);
        self::assertResponseStatusCodeSame(403);
    }

    public function testApprovingEventRejectsUnchangedPrivateHtml(): void
    {
        $admin = $this->account()->addRole('ROLE_ADMIN');
        $media = [...$this->attachment($this->account())->getMedias()][0];
        $event = $this->em->getRepository(Event::class)->findOneBy([]);
        $review = (new EventReview())->setStatus(EventReviewStatusType::AWAITING);
        $event->setReview($review)->setEnabled(false);
        $event->setBody('<img src="/media/default/0001/01/' . $media->getProviderReference() . '">');
        $this->em->persist($review);
        $this->em->flush();
        $id = $event->getId();
        $this->login($admin->getEmail());
        $result = $this->graphResponse('mutation($input:ReviewEventInput!){reviewEvent(input:$input){event{id}}}', ['input' => ['id' => GlobalId::toGlobalId('Event', $id), 'status' => 'APPROVED']]);
        self::assertSame('MEDIA_REUSE_DENIED', $result['errors'][0]['extensions']['code']);
        $this->em->clear();
        self::assertFalse($this->em->find(Event::class, $id)->isEnabledOrApproved());
    }

    public function testScheduledArticleRejectsPrivateHtml(): void
    {
        $admin = $this->account()->addRole('ROLE_ADMIN');
        $media = [...$this->attachment($this->account())->getMedias()][0];
        $post = $this->em->getRepository(Post::class)->findOneBy([]);
        $id = $post->getId();
        $previous = $post->getBody();
        $this->login($admin->getEmail());
        $result = $this->graphResponse('mutation($input:UpdatePostInput!){updatePost(input:$input){post{id}}}', ['input' => [
            'id' => GlobalId::toGlobalId('Post', $id), 'authors' => [GlobalId::toGlobalId('User', $admin->getId())],
            'translations' => [['locale' => 'FR_FR', 'title' => 'Scheduled article', 'body' => '<img src="/media/default/0001/01/' . $media->getProviderReference() . '">']],
            'publishedAt' => (new \DateTime('+1 day'))->format('Y-m-d H:i:s'), 'isPublished' => true, 'displayedOnBlog' => true, 'commentable' => false, 'projects' => [], 'proposals' => [], 'themes' => [],
        ]]);
        self::assertSame('MEDIA_REUSE_DENIED', $result['errors'][0]['extensions']['code']);
        $this->em->clear();
        self::assertSame($previous, $this->em->find(Post::class, $id)->getBody());
    }

    /** @dataProvider privatePageHtml */
    public function testPublishingPageRejectsUnchangedPrivateHtml(string $markup): void
    {
        $admin = $this->account()->addRole('ROLE_ADMIN');
        $media = [...$this->attachment($this->account())->getMedias()][0];
        $page = $this->em->getRepository(Page::class)->findOneBy([]);
        $page->setIsEnabled(false);
        $page->setBody(sprintf($markup, '/media/default/0001/01/' . $media->getProviderReference()));
        $this->em->flush();
        $id = $page->getId();
        $this->login($admin->getEmail());
        $result = $this->graphResponse('mutation($input:UpdatePageInput!){updatePage(input:$input){page{id}}}', ['input' => ['id' => GlobalId::toGlobalId('Page', $id), 'isEnabled' => true, 'translations' => [['locale' => 'FR_FR', 'title' => $page->getTitle(), 'body' => $page->getBody()]]]]);
        self::assertSame('MEDIA_REUSE_DENIED', $result['errors'][0]['extensions']['code']);
        $this->em->clear();
        self::assertFalse($this->em->find(Page::class, $id)->getIsEnabled());
    }

    /** @return iterable<string, array{string}> */
    public static function privatePageHtml(): iterable
    {
        yield 'image' => ['<img src="%s">'];

        yield 'srcset' => ['<img srcset="%s 2x">'];
    }

    public function testRejectedSubmissionKeepsPrivateUploadAvailableForRetry(): void
    {
        $owner = $this->account();
        $forbidden = [...$this->attachment($owner)->getMedias()][0];
        $form = $this->em->find(ProposalForm::class, 'proposalForm4');
        $form->setUsingDescription(true);
        $form->getStep()->setEndAt(new \DateTime('+1 year'));
        $form->getStep()->setPrivate(false);
        $form->getStep()->getProject()->setVisibility(2);
        $question = (new SimpleQuestion())->setTitle('Private editor')->setType(2)->setPrivate(true);
        $link = (new QuestionnaireAbstractQuestion())->setQuestion($question)->setProposalForm($form)->setPosition(100);
        $form->addQuestion($link);
        $proposal = (new Proposal())->setTitle('Retry private upload')->setProposalForm($form)->setAuthor($owner)->setDraft(false)->setBody('<p>Original</p>')->setPublishedAt(new \DateTime('-1 day'));
        foreach ([$question, $link, $proposal] as $entity) {
            $this->em->persist($entity);
        }
        $this->em->flush();
        $this->login($owner->getEmail());
        $questionId = GlobalId::toGlobalId('Question', $question->getId());
        $file = tempnam(sys_get_temp_dir(), 'media-retry-');
        self::assertIsString($file);
        $this->files[] = $file;
        file_put_contents($file, base64_decode(self::PNG));
        $this->setFeature('antivirus', false);
        $this->browser->request('POST', '/api/files', ['questionId' => $questionId], ['file' => new UploadedFile($file, 'retry.png', 'image/png', null, true)]);
        self::assertResponseStatusCodeSame(201);
        $uploaded = json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
        $media = $this->em->find(Media::class, $uploaded['id']);
        $this->files[] = $this->root() . '/default/0001/01/' . $media->getProviderReference();
        $html = '<img src="/media/default/0001/01/' . $media->getProviderReference() . '">';
        $query = 'mutation($input:ChangeProposalContentInput!){changeProposalContent(input:$input){proposal{id}}}';
        $input = [
            'id' => GlobalId::toGlobalId('Proposal', $proposal->getId()), 'title' => $proposal->getTitle(), 'draft' => false,
            'body' => '<img src="/media/default/0001/01/' . $forbidden->getProviderReference() . '">',
            'responses' => [['question' => $questionId, 'value' => $html]],
        ];
        $result = $this->graphResponse($query, ['input' => $input]);
        self::assertSame('MEDIA_REUSE_DENIED', $result['errors'][0]['extensions']['code']);
        self::assertSame('body', $result['errors'][0]['extensions']['field']);
        $this->em->clear();
        self::assertNull($this->em->find(Media::class, $uploaded['id'])->getMetadataValue('private_html_responses'));

        $input['body'] = '<p>Corrected public description</p>';
        $result = $this->graphResponse($query, ['input' => $input]);
        self::assertArrayNotHasKey('errors', $result, json_encode($result, \JSON_THROW_ON_ERROR));
        $this->em->clear();
        $saved = $this->em->find(Proposal::class, $proposal->getId());
        self::assertSame($input['body'], $saved->getBody());
        $responses = $this->em->getRepository(ValueResponse::class)->findBy(['proposal' => $saved, 'question' => $question->getId()]);
        self::assertCount(1, $responses);
        self::assertSame($html, $responses[0]->getValue());
    }

    public function testPrivateEditorCannotGrantAccessToAnotherAuthorsMedia(): void
    {
        $media = [...$this->attachment($this->account())->getMedias()][0];
        $owner = $this->account();
        $form = $this->em->find(ProposalForm::class, 'proposalForm4');
        $form->getStep()->setEndAt(new \DateTime('+1 year'));
        $question = (new SimpleQuestion())->setTitle('Private editor')->setType(2)->setPrivate(true);
        $link = (new QuestionnaireAbstractQuestion())->setQuestion($question)->setProposalForm($form)->setPosition(100);
        $form->addQuestion($link);
        $proposal = (new Proposal())->setTitle('Private editor grant test')->setProposalForm($form)->setAuthor($owner)->setDraft(true);
        foreach ([$question, $link, $proposal] as $entity) {
            $this->em->persist($entity);
        }
        $this->em->flush();
        $this->login($owner->getEmail());
        $questionId = GlobalId::toGlobalId('Question', $question->getId());
        $result = $this->graphResponse('mutation($input:ChangeProposalContentInput!){changeProposalContent(input:$input){proposal{id}}}', ['input' => [
            'id' => GlobalId::toGlobalId('Proposal', $proposal->getId()), 'title' => $proposal->getTitle(), 'draft' => true,
            'responses' => [['question' => $questionId, 'value' => '<img src="/media/default/0001/01/' . $media->getProviderReference() . '">']],
        ]]);
        self::assertSame('MEDIA_REUSE_DENIED', $result['errors'][0]['extensions']['code']);
        self::assertSame($questionId, $result['errors'][0]['extensions']['questionId']);
        $this->em->clear();
        self::assertNull($this->em->find(Media::class, $media->getId())->getMetadataValue('private_html_responses'));
        $this->browser->request('GET', '/media/default/0001/01/' . $media->getProviderReference());
        self::assertResponseStatusCodeSame(403);
    }

    /** @dataProvider publicAttachmentOrigins */
    public function testPublicFileCannotBecomePrivateThroughANewAnswer(bool $converted): void
    {
        $owner = $this->account();
        $media = $this->media();
        if ($converted) {
            $media->setMetadataValue('historical_public_original', '1');
        }
        $project = $this->em->getRepository(Project::class)->findOneBy(['visibility' => 2]);
        $project->setCover($media);
        $projectId = $project->getId();
        $form = $this->em->find(ProposalForm::class, 'proposalForm4');
        $form->getStep()->setEndAt(new \DateTime('+1 year'));
        $question = (new MediaQuestion())->setTitle('Private file')->setPrivate(true);
        $link = (new QuestionnaireAbstractQuestion())->setQuestion($question)->setProposalForm($form)->setPosition(100);
        $form->addQuestion($link);
        $proposal = (new Proposal())->setTitle('Public original reuse')->setProposalForm($form)->setAuthor($owner)->setDraft(true);
        foreach ([$question, $link, $proposal] as $entity) {
            $this->em->persist($entity);
        }
        $this->em->flush();
        $this->login($owner->getEmail());
        $result = $this->graphResponse('mutation($input:ChangeProposalContentInput!){changeProposalContent(input:$input){proposal{id}}}', ['input' => [
            'id' => GlobalId::toGlobalId('Proposal', $proposal->getId()), 'title' => $proposal->getTitle(), 'draft' => true,
            'responses' => [['question' => GlobalId::toGlobalId('Question', $question->getId()), 'medias' => [$media->getId()]]],
        ]]);
        self::assertSame('MEDIA_REUSE_DENIED', $result['errors'][0]['extensions']['code']);
        $this->em->clear();
        self::assertNull($this->em->find(Media::class, $media->getId())->getMetadataValue('private_attachment'));
        self::assertSame($media->getId(), $this->em->find(Project::class, $projectId)->getCover()->getId());
        self::assertCount(0, $this->em->getRepository(MediaResponse::class)->findBy(['proposal' => $proposal->getId()]));
        $this->logout();
        $this->browser->getCookieJar()->clear();
        $this->browser->request('GET', '/media/default/0001/01/' . $media->getProviderReference());
        self::assertResponseStatusCodeSame(200);
    }

    /** @return iterable<string, array{bool}> */
    public static function publicAttachmentOrigins(): iterable
    {
        yield 'converted original' => [true];

        yield 'ordinary public cover' => [false];
    }

    /** @dataProvider mediaReadModes */
    public function testMediaGraphqlEnforcementCanBeToggled(string $schema, bool $enforce, string $access): void
    {
        $this->setFeatureFlags(['private_media_read_enforcement' => $enforce]);
        $owner = $this->account();
        $reader = 'owner' === $access ? $owner : $this->account();
        $media = $this->media();
        $district = (new GlobalDistrict())->setName('Historical public cover')->setCover($media);
        $token = bin2hex(random_bytes(16));
        $this->em->persist(new PublicApiToken($reader, $token));
        $this->em->persist($district);
        $this->em->flush();
        if ('public' !== $access) {
            $this->attachment($owner, $media);
        }
        $query = ['query' => 'query($id:ID!){node(id:$id){...on GlobalDistrict{cover{url}}}}', 'variables' => ['id' => GlobalId::toGlobalId('District', $district->getId())]];
        $this->browser->request('POST', 'preview' === $schema ? '/graphql' : '/graphql/internal', [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'preview' === $schema ? 'application/vnd.cap-collectif.preview+json' : 'application/json',
            'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
        ], json_encode($query, \JSON_THROW_ON_ERROR));
        self::assertResponseStatusCodeSame(200);
        $result = json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
        self::assertArrayNotHasKey('errors', $result, json_encode($result, \JSON_THROW_ON_ERROR));
        if ('private' === $access && $enforce) {
            self::assertSame('Access denied to this field.', $result['extensions']['warnings'][0]['message']);
        } else {
            self::assertArrayNotHasKey('warnings', $result['extensions'] ?? [], json_encode($result, \JSON_THROW_ON_ERROR));
            self::assertStringContainsString($media->getProviderReference(), $result['data']['node']['cover']['url']);
        }
    }

    /** @return iterable<string, array{string, bool, string}> */
    public static function mediaReadModes(): iterable
    {
        foreach (['internal', 'preview'] as $schema) {
            foreach ([false, true] as $enforce) {
                foreach (['public', 'private', 'owner'] as $access) {
                    yield sprintf('%s enforcement %d %s', $schema, $enforce, $access) => [$schema, $enforce, $access];
                }
            }
        }
    }

    /** @dataProvider editorPrivacyChanges */
    public function testEditorPrivacyTransitionRejectsPublicMedia(string $privacy): void
    {
        $owner = $this->account();
        $owner->addRole('ROLE_ADMIN');
        $form = (new ProposalForm())->setTitle('Assessment')->setOwner($owner);
        $proposal = (new Proposal())->setTitle('Assessment')->setProposalForm($form)->setAuthor($owner)->setDraft(false);
        $question = (new SimpleQuestion())->setTitle('Editor')->setType(2)->setPrivate(false);
        $association = (new QuestionnaireAbstractQuestion())->setProposalForm($form)->setQuestion($question)->setPosition(1);
        $form->addQuestion($association);
        $media = $this->media();
        $path = '/media/default/0001/01/' . $media->getProviderReference();
        $response = (new ValueResponse())->setQuestion($question)->setProposal($proposal)->setValue('<img src="' . $path . '">');
        foreach ([$form, $association, $proposal, $question, $response] as $entity) {
            $this->em->persist($entity);
        }
        $this->em->flush();
        $questionId = $question->getId();
        $this->login($owner->getEmail());
        $result = $this->graphResponse('mutation($input:UpdateProposalFormInput!){updateProposalForm(input:$input){proposalForm{id}}}', ['input' => [
            'proposalFormId' => $form->getId(),
            'questions' => [['question' => ['id' => GlobalId::toGlobalId('Question', $questionId), 'title' => 'Editor', 'type' => 'editor', $privacy => true]]],
        ]]);
        self::assertSame('MEDIA_REUSE_DENIED', $result['errors'][0]['extensions']['code']);
        self::assertSame('value', $result['errors'][0]['extensions']['field']);
        self::assertSame(GlobalId::toGlobalId('Question', $questionId), $result['errors'][0]['extensions']['questionId']);
        $this->logout();
        $this->em->clear();
        self::assertFalse($this->em->find(SimpleQuestion::class, $questionId)->isPrivate());
        self::assertFalse($this->em->find(SimpleQuestion::class, $questionId)->getHidden());
        self::assertNull($this->em->find(Media::class, $media->getId())->getMetadataValue('private_attachment'));
        $this->browser->request('GET', $path);
        self::assertResponseStatusCodeSame(200);
    }

    /** @return iterable<string, array{string}> */
    public static function editorPrivacyChanges(): iterable
    {
        yield 'private' => ['private'];

        yield 'hidden' => ['hidden'];
    }

    /** @dataProvider incompleteHtmlViewers */
    public function testIncompleteReplyHtmlMediaFollowsOwnership(string $viewer, int $status): void
    {
        $owner = $this->account();
        $questionnaire = (new Questionnaire())->setTitle('Assessment')->setOwner($owner);
        $reply = (new Reply())->setQuestionnaire($questionnaire)->setAuthor($owner)->setMissingRequirementsStatus();
        $question = (new SimpleQuestion())->setTitle('Editor')->setType(2);
        $media = $this->media();
        $media->setMetadataValue('private_attachment', '1');
        $response = (new ValueResponse())->setQuestion($question)->setReply($reply)->setValue('Before historical link');
        foreach ([$questionnaire, $reply, $question, $response] as $entity) {
            $this->em->persist($entity);
        }
        $this->em->flush();
        $this->em->getConnection()->update($this->em->getClassMetadata(ValueResponse::class)->getTableName(), ['value' => json_encode('<img src="/media/default/0001/01/' . $media->getProviderReference() . '">')], ['id' => $response->getId()]);
        $this->em->getConnection()->update('media__media', ['provider_metadata' => json_encode(['private_attachment' => '1', 'private_html_responses' => [$response->getId()]])], ['id' => $media->getId()]);
        if ('owner' === $viewer) {
            $this->login($owner->getEmail());
        } elseif ('other' === $viewer) {
            $this->login($this->account()->getEmail());
        }
        $path = '/media/default/0001/01/' . $media->getProviderReference();
        $this->em->clear();
        self::assertTrue($this->em->getFilters()->isEnabled('contributionCompletionStatus'));
        $this->browser->request('GET', $path);
        self::assertResponseStatusCodeSame($status);
        self::assertTrue($this->em->getFilters()->isEnabled('contributionCompletionStatus'));
    }

    /** @return iterable<string, array{string, int}> */
    public static function incompleteHtmlViewers(): iterable
    {
        yield 'owner' => ['owner', 200];

        yield 'anonymous' => ['anonymous', 403];

        yield 'other user' => ['other', 403];
    }

    private function attachment(User $owner, ?Media $media = null): MediaResponse
    {
        $questionnaire = (new Questionnaire())->setTitle('Private files')->setOwner($owner);
        $reply = (new Reply())->setQuestionnaire($questionnaire)->setAuthor($owner);
        $question = (new MediaQuestion())->setTitle('Document')->setPrivate(false);
        // Model private upload classification, including deliberately seeded historical sharing.
        $media ??= $this->media();
        $media->setMetadataValue('private_attachment', '1');
        $response = (new MediaResponse())->setQuestion($question)->setReply($reply)->addMedia($media);
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
