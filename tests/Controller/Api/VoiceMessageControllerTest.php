<?php

namespace Capco\Tests\Controller\Api;

use Capco\AppBundle\Antivirus\AntivirusScanner;
use Capco\AppBundle\Controller\Api\MediasController;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\VocalContribution;
use Capco\AppBundle\Manager\MediaManager;
use Capco\AppBundle\Service\VocalContributionUploadService;
use Capco\AppBundle\Twig\MediaExtension;
use PHPUnit\Framework\TestCase;
use Symfony\Component\DependencyInjection\Container;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;

/**
 * @internal
 * @coversNothing
 */
class VoiceMessageControllerTest extends TestCase
{
    /**
     * @dataProvider uploadCases
     */
    public function testUpload(string $scenario, int $expectedStatus): void
    {
        $service = $this->createMock(VocalContributionUploadService::class);
        $csrf = $this->createStub(CsrfTokenManagerInterface::class);
        $csrf->method('isTokenValid')->willReturn('csrf' !== $scenario);
        $container = new Container();
        $container->set('security.csrf.token_manager', $csrf);
        $controller = $this->getMockBuilder(MediasController::class)
            ->setConstructorArgs([
                $this->createStub(MediaManager::class),
                $this->createStub(MediaExtension::class),
                $this->createStub(AntivirusScanner::class),
                $service,
            ])
            ->onlyMethods(['getUser'])
            ->getMock()
        ;
        $controller->method('getUser')->willReturn(null);
        $controller->setContainer($container);

        $file = $this->createMock(UploadedFile::class);
        $contribution = (new VocalContribution())->setId('vocal-id');
        if ('success' === $scenario) {
            $service->expects(self::once())->method('upload')->with($file, null, null)->willReturn($contribution);
        } elseif ('success-with-participant' === $scenario) {
            $service->expects(self::once())->method('upload')->with($file, null, null)->willReturn($contribution->setParticipant((new Participant())->setToken('participant-token')));
        } else {
            $service->expects(self::never())->method('upload');
        }

        $request = new Request([], [], [], [], 'missing-file' === $scenario ? [] : ['file' => $file], ['HTTP_X_CSRF_TOKEN' => 'token', 'REMOTE_ADDR' => '127.0.0.1']);
        $response = $controller->postVoiceMessageAction($request);
        self::assertSame($expectedStatus, $response->getStatusCode());
        if ('success' === $scenario) {
            self::assertSame(['vocalId' => 'Vm9jYWxDb250cmlidXRpb246dm9jYWwtaWQ='], json_decode((string) $response->getContent(), true));
        } elseif ('success-with-participant' === $scenario) {
            self::assertSame([
                'vocalId' => 'Vm9jYWxDb250cmlidXRpb246dm9jYWwtaWQ=',
                'participantToken' => 'participant-token',
            ], json_decode((string) $response->getContent(), true));
        }
    }

    public static function uploadCases(): \Generator
    {
        yield ['csrf', 403];
        yield ['missing-file', 400];
        yield ['success', 201];
        yield ['success-with-participant', 201];
    }
}
