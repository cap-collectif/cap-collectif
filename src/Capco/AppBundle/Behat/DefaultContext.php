<?php

namespace Capco\AppBundle\Behat;

use Behat\Behat\Hook\Scope\AfterStepScope;
use Behat\Behat\Hook\Scope\BeforeScenarioScope;
use Behat\Mink\Driver\Selenium2Driver;
use Behat\MinkExtension\Context\MinkContext;
use Behat\Testwork\Tester\Result\TestResult;
use Capco\AppBundle\Utils\Text;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Session\Session;
use Symfony\Component\HttpKernel\KernelInterface;
use Symfony\Component\Security\Core\User\UserInterface;

abstract class DefaultContext extends MinkContext
{
    protected $navigationContext;

    public function __construct(private readonly KernelInterface $kernel, protected ?Session $symfonySession = null)
    {
    }

    /** @BeforeScenario */
    public function gatherContexts(BeforeScenarioScope $scope)
    {
        $environment = $scope->getEnvironment();

        if ($environment->hasContextClass(NavigationContext::class)) {
            $this->navigationContext = $environment->getContext(NavigationContext::class);
        }
        if ($environment->hasContextClass(ExportContext::class)) {
            $this->exportContext = $environment->getContext(ExportContext::class);
        }
    }

    /**
     * @AfterStep
     */
    public function printLastResponseOnError(AfterStepScope $stepScope)
    {
        $resultCode = $stepScope->getTestResult()->getResultCode();
        $stepName = $stepScope->getStep()->getText();
        if (TestResult::FAILED === $resultCode) {
            $this->saveDebugScreenshot($stepName);
        }
    }

    /**
     * @Then save a screenshot
     *
     * @param null|mixed $stepName
     */
    public function saveDebugScreenshot($stepName = null)
    {
        $driver = $this->getSession()->getDriver();

        if (!$driver instanceof Selenium2Driver) {
            return;
        }

        $filename = null;
        if (!$stepName) {
            $filename = microtime(true) . '.png';
        } else {
            $stepNameSimplify = Text::sanitizeFileName($stepName);
            $filename = $stepNameSimplify . microtime(true) . '.png';
        }

        $path = $this->getContainer()->getParameter('kernel.project_dir') . '/coverage/';

        if (!file_exists($path)) {
            mkdir($path);
        }
        $this->saveScreenshot($filename, $path);

        echo 'New screenshot generated ! Checkout `open "coverage/' . $filename . '"`' . \PHP_EOL;

        $html = $this->getSession()
            ->getDriver()
            ->getContent()
        ;

        $htmlFilename = str_replace('.png', '.html', $filename);
        file_put_contents($path . $htmlFilename, $html);

        echo 'New HTML generated ! Checkout `open "coverage/' . $htmlFilename . '"`' . \PHP_EOL;
    }

    /**
     * @Then /^(?:|I )should see '(?P<text>(?:[^']|\\')*)'$/
     *
     * @param mixed $text
     */
    public function assertPageContainsText($text)
    {
        $this->assertSession()->pageTextContains($this->fixStepArgument($text));
    }

    /**
     * Waits some time or until JS condition turns true.
     *
     * @throws \RuntimeException when the condition failed after timeout
     */
    public function waitAndThrowOnFailure(int $timeout, string $condition): void
    {
        while (str_contains('#navbar-username', $condition) && !$this->getSession()->wait($timeout, $condition)) {
            $this->getSession()->reload();
            sleep(10);
        }

        if (!$this->getSession()->wait($timeout, $condition)) {
            throw new \RuntimeException('Condition "' . $condition . '" failed after ' . $timeout . 'ms.');
        }
    }

    /**
     * Get entity manager.
     *
     * @return ObjectManager
     */
    protected function getEntityManager()
    {
        return $this->getService('doctrine')->getManager();
    }

    /**
     * Get Repository.
     */
    protected function getRepository(mixed $repo)
    {
        return $this->getEntityManager()->getRepository($repo);
    }

    /**
     * Returns Container instance.
     *
     * @return ContainerInterface
     */
    protected function getContainer()
    {
        return $this->kernel->getContainer();
    }

    /**
     * Get service by id.
     *
     * @param string $id
     *
     * @return object
     */
    protected function getService($id)
    {
        return $this->getContainer()->get($id);
    }

    /**
     * Get parameter by id.
     *
     * @param string $id
     *
     * @return object
     */
    protected function getParameter($id)
    {
        return $this->getContainer()->getParameter($id);
    }

    /**
     * Get current user instance.
     *
     * @throws \Exception
     *
     * @return null|UserInterface
     */
    protected function getUser()
    {
        $token = $this->getService('security.token_storage')->getToken();

        if (null === $token) {
            throw new \Exception('No token found in security context.');
        }

        return $token->getUser();
    }

    /**
     * Generate url.
     *
     * @param string $route
     * @param bool   $absolute
     *
     * @return string
     */
    protected function generateUrl($route, array $parameters = [], $absolute = false)
    {
        return $this->locatePath(
            $this->getService('router')->generate($route, $parameters, $absolute)
        );
    }
}
