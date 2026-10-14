<?php

namespace Capco\Tests\Controller;

use Capco\AdminBundle\Controller\VoiceMessageController;
use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\VocalContribution;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\VocalContributionRepository;
use Capco\AppBundle\Service\VocalContributionFilenameResolver;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use PHPUnit\Framework\TestCase;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * @internal
 * @coversNothing
 */
class VoiceMessageControllerTest extends TestCase
{
    /**
     * @dataProvider fileViewers
     */
    public function testPrivateFile(bool $isAdmin, bool $download): void
    {
        $authorization = $this->createStub(AuthorizationCheckerInterface::class);
        $authorization->method('isGranted')->willReturn($isAdmin);
        $container = new Container();
        $container->set('security.authorization_checker', $authorization);
        $controller = new VoiceMessageController();
        $controller->setContainer($container);
        $toggleManager = $this->createStub(Manager::class);
        $toggleManager->method('isActive')->willReturn(true);
        $media = (new Media())->setContext(Media::VOCAL_CONTRIBUTION_CONTEXT)->setName('voice.webm')->setContentType('audio/webm');
        $repository = $this->createMock(MediaRepository::class);
        $vocalRepository = $this->createMock(VocalContributionRepository::class);
        $repository->expects($isAdmin ? self::once() : self::never())->method('findOneBy')
            ->with(['id' => 'voice-id', 'context' => Media::VOCAL_CONTRIBUTION_CONTEXT])->willReturn($media)
        ;
        $provider = $this->createMock(MediaProvider::class);
        $path = tempnam(sys_get_temp_dir(), 'voice-test-');
        file_put_contents($path, 'private audio');
        $provider->expects($isAdmin ? self::once() : self::never())->method('getPrivateVoiceMessagePath')->willReturn($path);
        $vocalRepository->expects($isAdmin ? self::once() : self::never())->method('findOneBy')->willReturn(
            (new VocalContribution())->setId('vocal-id')->setMedia($media)
        );

        try {
            if (!$isAdmin) {
                $this->expectException(AccessDeniedException::class);
            }
            $request = Request::create('/admin/voice-messages/file', 'GET', ['download' => $download]);
            $request->headers->set('Range', 'bytes=0-3');
            $response = $controller->fileAction(
                'voice-id',
                $request,
                $toggleManager,
                $repository,
                $provider,
                $vocalRepository,
                new VocalContributionFilenameResolver()
            );
            $response->prepare($request);
            self::assertSame(206, $response->getStatusCode());
            self::assertSame('audio/webm', $response->headers->get('Content-Type'));
            self::assertTrue($response->headers->hasCacheControlDirective('private'));
            self::assertTrue($response->headers->hasCacheControlDirective('no-store'));
            self::assertStringStartsWith($download ? 'attachment;' : 'inline;', $response->headers->get('Content-Disposition'));
            ob_start();
            $response->sendContent();
            self::assertSame('priv', ob_get_clean());
        } finally {
            unlink($path);
        }
    }

    public function testPrivateFileAcceptsVocalContributionGlobalId(): void
    {
        $authorization = $this->createStub(AuthorizationCheckerInterface::class);
        $authorization->method('isGranted')->willReturn(true);
        $container = new Container();
        $container->set('security.authorization_checker', $authorization);
        $controller = new VoiceMessageController();
        $controller->setContainer($container);
        $toggleManager = $this->createStub(Manager::class);
        $toggleManager->method('isActive')->willReturn(true);
        $media = (new Media())->setContext(Media::VOCAL_CONTRIBUTION_CONTEXT)->setContentType('audio/webm');
        $vocal = (new VocalContribution())->setId('vocal-id')->setMedia($media);
        $mediaRepository = $this->createMock(MediaRepository::class);
        $mediaRepository->expects(self::never())->method('findOneBy');
        $vocalRepository = $this->createMock(VocalContributionRepository::class);
        $vocalRepository->expects(self::once())->method('find')->with('vocal-id')->willReturn($vocal);
        $vocalRepository->expects(self::never())->method('findOneBy');
        $provider = $this->createMock(MediaProvider::class);
        $path = tempnam(sys_get_temp_dir(), 'voice-test-');
        file_put_contents($path, 'private audio');
        $provider->expects(self::once())->method('getPrivateVoiceMessagePath')->with($media)->willReturn($path);

        try {
            $response = $controller->fileAction(
                GlobalId::toGlobalId('VocalContribution', 'vocal-id'),
                Request::create('/admin/voice-messages/file'),
                $toggleManager,
                $mediaRepository,
                $provider,
                $vocalRepository,
                new VocalContributionFilenameResolver()
            );

            self::assertSame('audio/webm', $response->headers->get('Content-Type'));
        } finally {
            unlink($path);
        }
    }

    public static function fileViewers(): \Generator
    {
        yield 'admin playback' => [true, false];
        yield 'admin download' => [true, true];
        yield 'non-admin denied' => [false, false];
    }
}
