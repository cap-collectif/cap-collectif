<?php

/**
 * This file is derived from:
 * http://github.com/sjparkinson/behat-file-system-context.
 */

namespace Capco\AppBundle\Behat;

use Behat\Behat\Context\Context;
use Behat\Behat\Hook\Scope\AfterScenarioScope;
use Behat\Behat\Hook\Scope\BeforeScenarioScope;
use Behat\Gherkin\Node\PyStringNode;
use org\bovigo\vfs\vfsStream;
use org\bovigo\vfs\vfsStreamDirectory;

require_once __DIR__ . '/../../../../vendor/phpunit/phpunit/src/Framework/Assert/Functions.php';

/**
 * Defines filesystem steps.
 */
class FileSystemContext implements Context
{
    protected vfsStreamDirectory $fileSystem;

    /**
     * Creates a new instance of FileSystemContext.
     */
    public function __construct()
    {
        $this->fileSystem = vfsStream::setup('');
    }

    public function getFileSystem(): vfsStreamDirectory
    {
        return $this->fileSystem;
    }

    /**
     * @BeforeScenario
     */
    public function beforeScenario(BeforeScenarioScope $scope)
    {
        $this->fileSystem = vfsStream::setup('');
    }

    /**
     * @AfterScenario
     */
    public function afterScenario(AfterScenarioScope $scope)
    {
    }

    /**
     * @Given :filename contains:
     * @Given the file :filename contains:
     */
    public function setFileContents(string $filename, PyStringNode $contents)
    {
        $file = vfsStream::newFile($filename)->at($this->fileSystem);

        file_put_contents($file->url(), (string) $contents);
    }

    /**
     * @Given a file :filename is prepared to be written on vsf
     */
    public function prepareFileToBeWrittenOnVfs(string $filename)
    {
        vfsStream::newFile($filename)->at($this->fileSystem);
    }

    /**
     * @Then :filename should exist
     * @Then the file :filename should exist
     */
    public function assertFileExists(string $filename)
    {
        assertTrue(
            $this->fileSystem->hasChild($filename),
            'The file %s does not exist.'
        );
    }

    /**
     * @Then :filename should contain:
     * @Then the file :filename should contain:
     */
    public function assertFileContents(string $filename, PyStringNode $expectedContent)
    {
        $actualContent = $this->getActualContent($filename);

        assertTrue(
            $actualContent === $expectedContent->getRaw(),
            sprintf('The contents of %s is not what was expected.', $filename)
        );
    }

    /**
     * @Then :filename should start with:
     * @Then the file :filename should start with:
     */
    public function assertFileStartWith(string $filename, PyStringNode $expectedContent)
    {
        $actualContent = $this->getActualContent($filename);

        assertTrue(
            str_starts_with($actualContent, $expectedContent->getRaw()),
            sprintf('The contents of %s does not begin with what was expected. Got: %s', $filename, $actualContent),
        );
    }

    /**
     * @Then :filename should end with:
     * @Then the file :filename should end with:
     */
    public function assertFileEndsWith(string $filename, PyStringNode $expectedContent)
    {
        $actualContent = $this->getActualContent($filename);

        assertTrue(
            str_ends_with($actualContent, $expectedContent->getRaw()),
            sprintf('The contents of %s does not end with what was expected. Got: %s', $filename, $actualContent),
        );
    }

    /**
     * @Then print the contents of :filename
     * @Then print the contents of file :filename
     */
    public function printFileContents(string $filename)
    {
        $this->assertFileExists($filename);
        $file = $this->fileSystem->getChild($filename);

        echo file_get_contents($file->url());
    }

    /**
     * @return false|string
     */
    private function getActualContent(string $filename)
    {
        $this->assertFileExists($filename);
        $file = $this->fileSystem->getChild($filename);

        return file_get_contents($file->url());
    }
}
