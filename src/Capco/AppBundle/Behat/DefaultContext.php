<?php

namespace Capco\AppBundle\Behat;

use Behat\Behat\Context\Context;
use Behat\Mink\Driver\Selenium2Driver;
use Behat\Behat\Hook\Scope\AfterStepScope;
use Behat\MinkExtension\Context\MinkContext;
use Behat\Testwork\Tester\Result\TestResult;
use Doctrine\Common\Persistence\ObjectManager;
use Behat\Behat\Hook\Scope\BeforeScenarioScope;
use Symfony\Component\HttpKernel\KernelInterface;
use Behat\Symfony2Extension\Context\KernelAwareContext;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

abstract class DefaultContext extends MinkContext implements Context, KernelAwareContext
{
    protected $navigationContext;

    /**
     * @var KernelInterface
     */
    protected $kernel;

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
     */
    public function saveDebugScreenshot($stepName = null)
    {
        $driver = $this->getSession()->getDriver();

        if (!$driver instanceof Selenium2Driver) {
            return;
        }

        if(!$stepName) {
            $filename = microtime(true) . '.png';
        } else {
            $stepNameSimplify = str_replace('"', '', $stepName);
            $stepNameSimplify = strtolower(str_replace(' ', '_', $stepNameSimplify));
            $filename = $stepNameSimplify . microtime(true) . '.png';
        }

        echo $filename;

        $path = $this->getContainer()->getParameter('kernel.project_dir') . '/coverage/';

        if (!file_exists($path)) {
            mkdir($path);
        }

        $this->saveScreenshot($filename, $path);
    }

    /**
     * {@inheritdoc}
     */
    public function setKernel(KernelInterface $kernel)
    {
        $this->kernel = $kernel;
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
        if (!$this->getSession()->wait($timeout, $condition)) {
            throw new \RuntimeException(
                'Condition "' . $condition . '" failed after ' . $timeout . 'ms.'
            );
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
     *
     * @param mixed $repo
     */
    protected function getRepository($repo)
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
