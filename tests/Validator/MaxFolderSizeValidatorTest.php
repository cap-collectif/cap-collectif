<?php

namespace Capco\Tests\Validator;

use Capco\AppBundle\Validator\Constraints\MaxFolderSize;
use Capco\AppBundle\Validator\Constraints\MaxFolderSizeValidator;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Finder\SplFileInfo;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Validator\Context\ExecutionContextInterface;
use Symfony\Component\Validator\Violation\ConstraintViolationBuilderInterface;

/**
 * @covers
 *
 * @internal
 */
class MaxFolderSizeValidatorTest extends TestCase
{
    private ExecutionContextInterface $context;
    private MaxFolderSize $constraint;
    private Finder $finder;
    private LoggerInterface $logger;

    protected function setUp(): void
    {
        $this->context = $this->createMock(ExecutionContextInterface::class);
        $this->finder = $this->createMock(Finder::class);
        $this->logger = $this->createMock(LoggerInterface::class);
        $this->constraint = new MaxFolderSize();
    }

    public function validateIgnoresNonUploadedFileValuesProvider(): \Generator
    {
        yield [null];

        yield ['string'];

        yield [[]];

        yield [123];

        yield [new \stdClass()];
    }

    /**
     * @covers
     */
    public function testValidateWithUploadedFileAndFolderSizeUnderLimit(): void
    {
        $maxFolderSizeValidator = $this->init();

        $file1 = $this->createMock(SplFileInfo::class);
        $file1->method('getSize')->willReturn(300000); // 300KB

        $file2 = $this->createMock(SplFileInfo::class);
        $file2->method('getSize')->willReturn(200000); // 200KB

        $files = [$file1, $file2]; // Total: 500KB < 1MB

        $this->mockFinder($files);

        $this->context->expects($this->never())->method('buildViolation');

        $maxFolderSizeValidator->validate($this->getUploadedFile(), $this->constraint);
    }

    /**
     * @covers
     */
    public function testValidateWithUploadedFileAndFolderSizeOverLimit(): void
    {
        $maxFolderSizeValidator = $this->init();

        $file1 = $this->createMock(SplFileInfo::class);
        $file1->method('getSize')->willReturn(700000); // 700KB

        $file2 = $this->createMock(SplFileInfo::class);
        $file2->method('getSize')->willReturn(400000); // 400KB

        $files = [$file1, $file2]; // Total: 1.1MB > 1MB

        $this->mockFinder($files);

        $violationBuilder = $this->createMock(ConstraintViolationBuilderInterface::class);
        $violationBuilder->expects($this->once())
            ->method('addViolation')
        ;
        $this->logger->expects($this->once())
            ->method('error')
            ->with('The size of the folder 1.1 Mo exceeds the allowed limit of 976.6 Ko.')
        ;

        $this->context->expects($this->once())
            ->method('buildViolation')
            ->with($this->constraint->message)
            ->willReturn($violationBuilder)
        ;

        $maxFolderSizeValidator->validate($this->getUploadedFile(), $this->constraint);
    }

    /**
     * @covers
     */
    public function testValidateWithEmptyFolder(): void
    {
        $maxFolderSizeValidator = $this->init();

        $files = [];

        $this->mockFinder($files);

        $this->context->expects($this->never())->method('buildViolation');

        $maxFolderSizeValidator->validate($this->getUploadedFile(), $this->constraint);
    }

    public function testValidateWithLargeFiles(): void
    {
        $maxFolderSizeValidator = $this->init();

        $file1 = $this->createMock(SplFileInfo::class);
        $file1->method('getSize')->willReturn(2000000); // 2MB

        $files = [$file1]; // Total: 2MB > 1MB

        $this->mockFinder($files);

        $violationBuilder = $this->createMock(ConstraintViolationBuilderInterface::class);
        $violationBuilder->expects($this->once())
            ->method('addViolation')
        ;
        $this->logger->expects($this->once())
            ->method('error')
            ->with('The size of the folder 1.9 Mo exceeds the allowed limit of 976.6 Ko.')
        ;

        $this->context->expects($this->once())
            ->method('buildViolation')
            ->with($this->constraint->message)
            ->willReturn($violationBuilder)
        ;

        $maxFolderSizeValidator->validate($this->getUploadedFile(), $this->constraint);
    }

    /**
     * @covers
     */
    public function testValidateWithMultipleSmallFiles(): void
    {
        $maxFolderSizeValidator = $this->init();

        $files = [];

        for ($i = 0; $i < 10; ++$i) {
            $file = $this->createMock(SplFileInfo::class);
            $file->method('getSize')->willReturn(50000); // 50KB chacun
            $files[] = $file;
        }
        // Total: 500KB < 1MB

        $this->mockFinder($files);

        $this->context->expects($this->never())->method('buildViolation');

        $maxFolderSizeValidator->validate($this->getUploadedFile(), $this->constraint);
    }

    /**
     * @covers
     */
    public function testValidateWithZeroSizeFiles(): void
    {
        $maxFolderSizeValidator = $this->init();

        $file1 = $this->createMock(SplFileInfo::class);
        $file1->method('getSize')->willReturn(0);

        $file2 = $this->createMock(SplFileInfo::class);
        $file2->method('getSize')->willReturn(0);

        $files = [$file1, $file2]; // Total: 0 bytes

        $this->mockFinder($files);

        $this->context->expects($this->never())->method('buildViolation');

        $maxFolderSizeValidator->validate($this->getUploadedFile(), $this->constraint);
    }

    /**
     * @param SplFileInfo[] $files
     */
    private function mockFinder(array $files): void
    {
        $this->finder->expects($this->once())
            ->method('files')
            ->willReturnSelf()
        ;

        $this->finder->expects($this->once())
            ->method('depth')
            ->with('== 0')
            ->willReturnSelf()
        ;

        $this->finder->expects($this->once())
            ->method('in')
            ->with('/tmp/test/public/media/default/0001/01/')
            ->willReturnSelf()
        ;

        $this->finder->expects($this->once())
            ->method('getIterator')
            ->willReturn(new \ArrayIterator($files))
        ;
    }

    private function init(): MaxFolderSizeValidator
    {
        $validator = new MaxFolderSizeValidator(1000000, '/tmp/test', $this->finder, $this->logger);
        $validator->initialize($this->context);

        return $validator;
    }

    private function getUploadedFile(): UploadedFile
    {
        return new UploadedFile(
            __FILE__,
            'test.txt',
            'text/plain',
            null,
            true
        );
    }
}
