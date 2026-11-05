<?php

declare(strict_types=1);

namespace Capco\Tests\Command;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\MediaQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Service\MediaAccessResolver;
use Capco\UserBundle\Entity\User;
use Gaufrette\Filesystem;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Security\Core\Authentication\Token\AnonymousToken;

/**
 * @internal
 */
final class SplitHistoricalPrivateMediaCommandTest extends DatabaseCommandTestCase
{
    /** @var list<string> */
    private array $paths = [];

    protected function tearDown(): void
    {
        $filesystem = self::getContainer()->get(Filesystem::class);
        foreach ($this->paths as $path) {
            if ($filesystem->has($path)) {
                $filesystem->delete($path);
            }
        }
        parent::tearDown();
    }

    public function testSimulationAndApplyPreservePublicUrlAndMovePrivateResponses(): void
    {
        [$media, $response, $project] = $this->legacy();
        $id = $media->getId();
        $reference = $media->getProviderReference();
        $responseId = $response->getId();
        $tester = $this->createCommandTester('capco:media:split-historical-private');
        self::assertSame(0, $tester->execute(['--media-id' => $id]));
        self::assertStringContainsString('private copy required', $tester->getDisplay());
        self::assertSame($id, $this->entityManager->getConnection()->fetchOne('SELECT media_id FROM responses_medias WHERE response_id = ?', [$responseId]));
        $this->paths[] = 'default/0001/01/private-' . Uuid::uuid5(Uuid::NAMESPACE_URL, 'capco-private-copy:' . $id)->toString() . '.txt';
        // Resume a verified file left before a previous database transaction committed.
        self::getContainer()->get(Filesystem::class)->write(end($this->paths), 'private bytes');
        self::assertSame(0, $tester->execute(['--media-id' => $id, '--apply' => true, '--maintenance-confirmed' => true]));
        $original = $this->entityManager->find(Media::class, $id);
        $copyId = $original->getMetadataValue('historical_private_copy');
        self::assertNotNull($copyId);
        $copy = $this->entityManager->find(Media::class, $copyId);

        self::assertSame($reference, $original->getProviderReference());
        self::assertSame($id, $this->entityManager->find(Project::class, $project->getId())->getCover()->getId());
        self::assertSame($copyId, $this->entityManager->getConnection()->fetchOne('SELECT media_id FROM responses_medias WHERE response_id = ?', [$responseId]));
        self::getContainer()->get('security.token_storage')->setToken(new AnonymousToken('main', 'anonymous'));
        $access = self::getContainer()->get(MediaAccessResolver::class);
        self::assertTrue($access->canView($original));
        self::assertFalse($access->canView($copy));
        self::assertTrue($access->canView($copy, $this->entityManager->getRepository(User::class)->find('user5')));
        self::assertSame('private bytes', self::getContainer()->get(Filesystem::class)->read(end($this->paths)));
        self::assertSame(0, $tester->execute(['--media-id' => $id, '--apply' => true, '--maintenance-confirmed' => true]));
        self::assertStringContainsString('Applied: 0 media', $tester->getDisplay());
    }

    public function testApplyRequiresMaintenanceAndMissingFileRemainsPrivate(): void
    {
        [$media] = $this->legacy();
        $tester = $this->createCommandTester('capco:media:split-historical-private');
        self::assertSame(2, $tester->execute(['--apply' => true, '--media-id' => $media->getId()]));
        self::getContainer()->get(Filesystem::class)->delete($this->paths[0]);
        self::assertSame(1, $tester->execute(['--apply' => true, '--maintenance-confirmed' => true, '--media-id' => $media->getId()]));
        self::assertSame('1', $this->entityManager->find(Media::class, $media->getId())->getMetadataValue('private_attachment'));
    }

    /** @dataProvider historicalHtmlPaths */
    public function testHistoricalPrivateHtmlMovesToOneProtectedCopy(string $prefix, bool $marked): void
    {
        [$media, $attachment] = $this->legacy();
        $question = (new SimpleQuestion())->setTitle('Private editor')->setType(2);
        $response = (new ValueResponse())->setQuestion($question)->setReply($attachment->getReply())->setValue('Before historical link');
        $this->entityManager->persist($question);
        $this->entityManager->persist($response);
        $this->entityManager->flush();
        $html = '<a href="' . $prefix . 'default/0001/01/' . $media->getProviderReference() . '">File</a>';
        $mapping = $this->entityManager->getClassMetadata($response::class);
        $this->entityManager->getConnection()->update($mapping->getTableName(), ['value' => json_encode($html)], ['id' => $response->getId()]);
        $this->entityManager->refresh($response);
        $this->entityManager->getConnection()->delete('responses_medias', ['response_id' => $attachment->getId()]);
        if (!$marked) {
            $this->entityManager->getConnection()->update('media__media', ['provider_metadata' => '{}'], ['id' => $media->getId()]);
        }
        $this->entityManager->clear();
        $id = $media->getId();
        $copyId = Uuid::uuid5(Uuid::NAMESPACE_URL, 'capco-private-copy:' . $id)->toString();
        $this->paths[] = 'default/0001/01/private-' . $copyId . '.txt';
        $tester = $this->createCommandTester('capco:media:split-historical-private');
        self::assertSame(0, $tester->execute(['--media-id' => $id, '--format' => 'json']));
        $report = json_decode($tester->getDisplay(), true, 512, \JSON_THROW_ON_ERROR);
        self::assertSame([$id], $report['eligible_media_ids']);
        self::assertSame([], $report['errors']);
        self::assertSame(0, $tester->execute(['--media-id' => $id, '--apply' => true, '--maintenance-confirmed' => true]));
        $copy = $this->entityManager->find(Media::class, $copyId);
        self::assertInstanceOf(Media::class, $copy);
        $rewritten = $this->entityManager->find(ValueResponse::class, $response->getId())->getValue();
        self::assertStringContainsString('/media/default/0001/01/' . $copy->getProviderReference(), $rewritten);
        self::assertSame('private bytes', self::getContainer()->get(Filesystem::class)->read('default/0001/01/' . $copy->getProviderReference()));
        self::assertStringContainsString(self::getContainer()->getParameter('router.request_context.host') . '/media/', $rewritten);
        self::assertStringNotContainsString($media->getProviderReference(), $rewritten);
        self::getContainer()->get('security.token_storage')->setToken(new AnonymousToken('main', 'anonymous'));
        $access = self::getContainer()->get(MediaAccessResolver::class);
        self::assertFalse($access->canView($copy));
        self::assertTrue($access->canView($copy, $this->entityManager->find(User::class, 'user5')));
        self::assertTrue($access->canView($this->entityManager->find(Media::class, $id)));
    }

    /** @return iterable<string, array{string, bool}> */
    public static function historicalHtmlPaths(): iterable
    {
        yield 'marked source' => ['/media/', true];

        yield 'unmarked source' => ['/media/', false];

        yield 'marked cached thumbnail' => ['/media/cache/default_avatar/', true];

        yield 'unmarked cached thumbnail' => ['/media/cache/default_avatar/', false];
    }

    public function testConflictingCopyFileCannotPublishOriginalOrBeDeleted(): void
    {
        [$media, $response] = $this->legacy();
        $id = $media->getId();
        $copyId = Uuid::uuid5(Uuid::NAMESPACE_URL, 'capco-private-copy:' . $id)->toString();
        $path = 'default/0001/01/private-' . $copyId . '.txt';
        $this->paths[] = $path;
        $filesystem = self::getContainer()->get(Filesystem::class);
        $filesystem->write($path, 'Unrelated bytes');
        $tester = $this->createCommandTester('capco:media:split-historical-private');
        self::assertSame(1, $tester->execute(['--media-id' => $id, '--apply' => true, '--maintenance-confirmed' => true]));
        self::assertSame('Unrelated bytes', $filesystem->read($path));
        self::assertSame('1', $this->entityManager->find(Media::class, $id)->getMetadataValue('private_attachment'));
        self::assertSame($id, $this->entityManager->getConnection()->fetchOne('SELECT media_id FROM responses_medias WHERE response_id = ?', [$response->getId()]));
        self::assertNull($this->entityManager->find(Media::class, $copyId));
    }

    public function testAmbiguousReferencePreventsConversion(): void
    {
        [$media] = $this->legacy();
        $table = $this->entityManager->getClassMetadata(User::class)->getTableName();
        $this->entityManager->getConnection()->update($table, ['media_id' => $media->getId()], ['id' => 'user1']);
        $this->entityManager->clear();
        $tester = $this->createCommandTester('capco:media:split-historical-private');
        self::assertSame(1, $tester->execute(['--media-id' => $media->getId(), '--apply' => true, '--maintenance-confirmed' => true]));
        self::assertStringContainsString('ambiguous reference', $tester->getDisplay());
        self::assertSame('1', $this->entityManager->find(Media::class, $media->getId())->getMetadataValue('private_attachment'));
    }

    public function testPublicOriginalWithoutPrivateReferencesNeedsNoCopy(): void
    {
        [$media, $response] = $this->legacy();
        $this->entityManager->getConnection()->delete('responses_medias', ['response_id' => $response->getId()]);
        $this->entityManager->clear();
        $tester = $this->createCommandTester('capco:media:split-historical-private');
        self::assertSame(0, $tester->execute(['--media-id' => $media->getId(), '--apply' => true, '--maintenance-confirmed' => true]));
        self::assertStringContainsString('no copy required', $tester->getDisplay());
        $original = $this->entityManager->find(Media::class, $media->getId());
        self::assertNull($original->getMetadataValue('private_attachment'));
        self::assertNull($original->getMetadataValue('historical_private_copy'));
        self::assertSame('1', $original->getMetadataValue('historical_public_original'));
    }

    public function testSimulationReportsProgressWithoutChangingMedia(): void
    {
        [$first] = $this->legacy();
        [$second] = $this->legacy();
        $connection = $this->entityManager->getConnection();
        $tester = $this->createCommandTester('capco:media:split-historical-private');
        self::assertSame(0, $tester->execute([]));
        self::assertStringContainsString($second->getId() . ': 1 public reference(s), 1 confidential reference(s)', $tester->getDisplay());
        self::assertStringContainsString('Inventory complete', $tester->getDisplay());
        self::assertStringContainsString('Checking media', $tester->getDisplay());
        self::assertStringContainsString('Eligible media IDs', $tester->getDisplay());
        $summary = substr($tester->getDisplay(), (int) strpos($tester->getDisplay(), 'Eligible media IDs'));
        self::assertStringContainsString($second->getId(), $summary);
        self::assertStringNotContainsString($first->getId(), $summary);
        foreach ([$first, $second] as $media) {
            $metadata = json_decode((string) $connection->fetchOne('SELECT provider_metadata FROM media__media WHERE id = ?', [$media->getId()]), true);
            self::assertSame('1', $metadata['private_attachment']);
            self::assertArrayNotHasKey('historical_private_copy', $metadata);
        }
    }

    public function testSimulationIncludesUnicodeEscapedHtmlInJson(): void
    {
        [$media, $attachment] = $this->legacy();
        $question = (new SimpleQuestion())->setTitle('Private editor')->setType(2);
        $response = (new ValueResponse())->setQuestion($question)->setReply($attachment->getReply())->setValue('Before historical link');
        $this->entityManager->persist($question);
        $this->entityManager->persist($response);
        $this->entityManager->flush();
        $html = '<a href="/media/default/0001/01/' . $media->getProviderReference() . '">File</a>';
        $mapping = $this->entityManager->getClassMetadata($response::class);
        $encoded = json_encode($html, \JSON_HEX_TAG | \JSON_THROW_ON_ERROR);
        $connection = $this->entityManager->getConnection();
        $connection->update($mapping->getTableName(), ['value' => $encoded], ['id' => $response->getId()]);
        $this->entityManager->clear();
        $tester = $this->createCommandTester('capco:media:split-historical-private');
        self::assertSame(0, $tester->execute(['--media-id' => $media->getId(), '--batch-size' => 1]));
        self::assertStringContainsString('2 confidential reference(s)', $tester->getDisplay());
        self::assertSame($encoded, $connection->fetchOne('SELECT value FROM ' . $mapping->getTableName() . ' WHERE id = ?', [$response->getId()]));
        self::assertSame('1', $this->entityManager->find(Media::class, $media->getId())->getMetadataValue('private_attachment'));
    }

    public function testJsonAuditReportsEligibleIdsErrorsAndDurationWithoutWriting(): void
    {
        [$media, $response] = $this->legacy();
        $id = $media->getId();
        $tester = $this->createCommandTester('capco:media:split-historical-private');
        self::assertSame(0, $tester->execute(['--format' => 'json', '--media-id' => $id]));
        $report = json_decode($tester->getDisplay(), true, 512, \JSON_THROW_ON_ERROR);
        self::assertSame('simulation', $report['mode']);
        self::assertTrue($report['completed']);
        self::assertSame(1, $report['checked_media_count']);
        self::assertSame([$id], $report['eligible_media_ids']);
        self::assertSame([], $report['converted_media_ids']);
        self::assertSame([], $report['errors']);
        self::assertGreaterThanOrEqual(0, $report['duration_seconds']);
        self::assertSame($id, $this->entityManager->getConnection()->fetchOne('SELECT media_id FROM responses_medias WHERE response_id = ?', [$response->getId()]));
        self::assertSame('1', $this->entityManager->find(Media::class, $id)->getMetadataValue('private_attachment'));

        self::getContainer()->get(Filesystem::class)->delete($this->paths[0]);
        self::assertSame(1, $tester->execute(['--format' => 'json', '--media-id' => $id]));
        $report = json_decode($tester->getDisplay(), true, 512, \JSON_THROW_ON_ERROR);
        self::assertTrue($report['completed']);
        self::assertSame([], $report['eligible_media_ids']);
        self::assertSame([['media_id' => $id, 'message' => 'Source file is missing.']], $report['errors']);
        self::assertGreaterThanOrEqual(0, $report['duration_seconds']);
    }

    public function testJsonAuditReportsInvalidOptionsAsIncomplete(): void
    {
        $tester = $this->createCommandTester('capco:media:split-historical-private');
        self::assertSame(2, $tester->execute(['--format' => 'json', '--batch-size' => 0]));
        $report = json_decode($tester->getDisplay(), true, 512, \JSON_THROW_ON_ERROR);
        self::assertFalse($report['completed']);
        self::assertSame(0, $report['checked_media_count']);
        self::assertSame([], $report['eligible_media_ids']);
        self::assertSame([['media_id' => null, 'message' => 'batch-size must be between 1 and 1000.']], $report['errors']);
        self::assertGreaterThanOrEqual(0, $report['duration_seconds']);
    }

    /** @return array{Media, MediaResponse, Project} */
    private function legacy(bool $publicReference = true): array
    {
        $owner = $this->entityManager->getRepository(User::class)->find('user5');
        $questionnaire = (new Questionnaire())->setTitle('Split test')->setOwner($owner);
        $reply = (new Reply())->setQuestionnaire($questionnaire)->setAuthor($owner);
        $question = (new MediaQuestion())->setTitle('Private attachment');
        $media = (new Media())->setName('split.txt')->setProviderReference(bin2hex(random_bytes(16)) . '.txt')->setContext('default')->setContentType('text/plain')->setSize(13);
        $media->setMetadataValue('private_attachment', '1');
        $response = (new MediaResponse())->setQuestion($question)->setReply($reply)->addMedia($media);
        foreach ([$questionnaire, $reply, $question, $media, $response] as $entity) {
            $this->entityManager->persist($entity);
        }
        $this->entityManager->flush();
        $project = $this->entityManager->getRepository(Project::class)->findOneBy(['visibility' => 2]);
        self::assertInstanceOf(Project::class, $project);
        if ($publicReference) {
            // Seed pre-validation historical data, not an authorized new publication.
            $this->entityManager->getConnection()->update('project', ['cover_id' => $media->getId()], ['id' => $project->getId()]);
            $this->entityManager->refresh($project);
        }
        $this->paths[] = 'default/0001/01/' . $media->getProviderReference();
        self::getContainer()->get(Filesystem::class)->write(end($this->paths), 'private bytes');

        return [$media, $response, $project];
    }
}
