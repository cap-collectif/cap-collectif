<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Video;
use Capco\AppBundle\Entity\VideoTranslation;
use Capco\AppBundle\Enum\VideoErrorCode;
use Capco\AppBundle\GraphQL\Mutation\Video\CreateVideoMutation;
use Capco\AppBundle\GraphQL\Mutation\Video\DeleteVideoMutation;
use Capco\AppBundle\GraphQL\Mutation\Video\UpdateVideoMutation;
use Capco\AppBundle\Repository\LocaleRepository;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\VideoRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class VideoMutationTest extends TestCase
{
    private MockObject & EntityManagerInterface $entityManager;
    private MockObject & LocaleRepository $localeRepository;
    private MockObject & MediaRepository $mediaRepository;
    private MockObject & UserRepository $userRepository;
    private MockObject & VideoRepository $videoRepository;

    protected function setUp(): void
    {
        $this->entityManager = $this->createMock(EntityManagerInterface::class);
        $this->localeRepository = $this->createMock(LocaleRepository::class);
        $this->mediaRepository = $this->createMock(MediaRepository::class);
        $this->userRepository = $this->createMock(UserRepository::class);
        $this->videoRepository = $this->createMock(VideoRepository::class);
    }

    public function testCreateRequiresATitleInTheDefaultLocale(): void
    {
        $this->localeRepository->expects(self::once())->method('getDefaultCode')->willReturn('fr-FR');
        $this->entityManager->expects(self::never())->method('persist');
        $this->entityManager->expects(self::never())->method('flush');

        self::assertSame(
            ['video' => null, 'errorCode' => VideoErrorCode::TITLE_REQUIRED],
            $this->createMutation()(new Argument(['input' => [
                'link' => 'https://example.test/video',
                'translations' => [['locale' => 'en-GB', 'title' => 'English title']],
            ]]))
        );
    }

    public function testCreatePersistsTheSubmittedVideoAndRelations(): void
    {
        $author = $this->createMock(User::class);
        $media = $this->createMock(Media::class);
        $persistedVideo = null;

        $this->localeRepository->expects(self::once())->method('getDefaultCode')->willReturn('fr-FR');
        $this->userRepository
            ->expects(self::once())
            ->method('find')
            ->with('user-id')
            ->willReturn($author)
        ;
        $this->mediaRepository
            ->expects(self::once())
            ->method('find')
            ->with('media-id')
            ->willReturn($media)
        ;
        $this->entityManager
            ->expects(self::once())
            ->method('persist')
            ->with(self::callback(function (Video $video) use (&$persistedVideo): bool {
                $persistedVideo = $video;

                return true;
            }))
        ;
        $this->entityManager->expects(self::once())->method('flush');

        $result = $this->createMutation()(new Argument(['input' => [
            'link' => ' https://example.test/video ',
            'translations' => [['locale' => 'fr-FR', 'title' => ' Video title ', 'body' => null]],
            'author' => GlobalId::toGlobalId('User', 'user-id'),
            'media' => 'media-id',
            'isEnabled' => false,
            'position' => 2,
        ]]));

        self::assertNull($result['errorCode']);
        self::assertInstanceOf(Video::class, $persistedVideo);
        self::assertSame('https://example.test/video', $persistedVideo->getLink());
        self::assertFalse($persistedVideo->getIsEnabled());
        self::assertSame(2, $persistedVideo->getPosition());
        self::assertSame($author, $persistedVideo->getAuthor());
        self::assertSame($media, $persistedVideo->getMedia());

        $translation = $persistedVideo->getTranslations()->get('fr-FR');
        self::assertInstanceOf(VideoTranslation::class, $translation);
        self::assertSame('Video title', $translation->getTitle());
        self::assertSame('', $translation->getBody());
    }

    public function testUpdateReturnsNotFoundWithoutFlushing(): void
    {
        $this->videoRepository->expects(self::once())->method('find')->with('missing-video')->willReturn(null);
        $this->entityManager->expects(self::never())->method('flush');

        self::assertSame(
            ['video' => null, 'errorCode' => VideoErrorCode::NOT_FOUND],
            $this->updateMutation()(new Argument(['input' => ['id' => 'missing-video']]))
        );
    }

    public function testUpdateClearsExplicitlyNullRelations(): void
    {
        $video = new Video();
        $video->setAuthor($this->createMock(User::class));
        $video->setMedia($this->createMock(Media::class));

        $this->videoRepository->expects(self::once())->method('find')->with('video-id')->willReturn($video);
        $this->localeRepository->expects(self::once())->method('getDefaultCode')->willReturn('fr-FR');
        $this->entityManager->expects(self::once())->method('flush');

        $result = $this->updateMutation()(new Argument(['input' => [
            'id' => 'video-id',
            'link' => 'https://example.test/video',
            'translations' => [['locale' => 'fr-FR', 'title' => 'Video title']],
            'author' => null,
            'media' => null,
        ]]));

        self::assertSame($video, $result['video']);
        self::assertNull($result['errorCode']);
        self::assertNull($video->getAuthor());
        self::assertNull($video->getMedia());
    }

    public function testDeleteRemovesTheFoundVideo(): void
    {
        $video = new Video();

        $this->videoRepository->expects(self::once())->method('find')->with('video-id')->willReturn($video);
        $this->entityManager->expects(self::once())->method('remove')->with($video);
        $this->entityManager->expects(self::once())->method('flush');

        self::assertSame(
            ['deletedVideoId' => 'video-id', 'errorCode' => null],
            (new DeleteVideoMutation($this->entityManager, $this->videoRepository))(
                new Argument(['input' => ['id' => 'video-id']])
            )
        );
    }

    public function testDeleteReturnsNotFoundWithoutRemovingAVideo(): void
    {
        $this->videoRepository->expects(self::once())->method('find')->with('missing-video')->willReturn(null);
        $this->entityManager->expects(self::never())->method('remove');
        $this->entityManager->expects(self::never())->method('flush');

        self::assertSame(
            ['deletedVideoId' => null, 'errorCode' => VideoErrorCode::NOT_FOUND],
            (new DeleteVideoMutation($this->entityManager, $this->videoRepository))(
                new Argument(['input' => ['id' => 'missing-video']])
            )
        );
    }

    private function createMutation(): CreateVideoMutation
    {
        return new CreateVideoMutation(
            $this->entityManager,
            $this->userRepository,
            $this->mediaRepository,
            $this->localeRepository
        );
    }

    private function updateMutation(): UpdateVideoMutation
    {
        return new UpdateVideoMutation(
            $this->entityManager,
            $this->videoRepository,
            $this->userRepository,
            $this->mediaRepository,
            $this->localeRepository
        );
    }
}
