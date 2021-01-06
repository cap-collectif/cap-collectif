<?php

namespace Capco\AppBundle\Behat;

use Behat\Mink\Element\DocumentElement;
use Capco\AppBundle\Behat\Traits\AdminSectionTrait;
use Capco\AppBundle\Behat\Traits\LocaleTrait;
use Capco\AppBundle\Command\CreateCsvFromEventParticipantsCommand;
use Capco\AppBundle\Command\CreateCsvFromProjectsContributorsCommand;
use Capco\AppBundle\Command\CreateStepContributorsCommand;
use Capco\AppBundle\Command\ExportAnalysisCSVCommand;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Locale;
use Capco\AppBundle\Entity\SSO\Oauth2SSOConfiguration;
use Elastica\Snapshot;
use http\Exception\RuntimeException;
use PHPUnit\Framework\Assert;
use Behat\Testwork\Suite\Suite;
use Capco\AppBundle\Utils\Text;
use Joli\JoliNotif\Notification;
use Behat\Gherkin\Node\TableNode;
use Capco\AppBundle\Toggle\Manager;
use Joli\JoliNotif\NotifierFactory;
use Behat\Mink\Driver\Selenium2Driver;
use Symfony\Component\Process\Process;
use Capco\AppBundle\Elasticsearch\Client;
use WebDriver\Exception\ElementNotVisible;
use Behat\Testwork\Tester\Result\TestResult;
use Capco\AppBundle\Behat\Traits\AdminTrait;
use Behat\Behat\Hook\Scope\AfterScenarioScope;
use Behat\Mink\Exception\ExpectationException;
use Behat\Testwork\Hook\Scope\AfterSuiteScope;
use Behat\Behat\Hook\Scope\BeforeScenarioScope;
use Capco\AppBundle\Elasticsearch\IndexBuilder;
use Capco\AppBundle\Behat\Traits\AdminEventTrait;
use Capco\AppBundle\Behat\Traits\ThemeStepsTrait;
use Behat\Mink\Exception\ElementNotFoundException;
use Capco\AppBundle\Behat\Traits\AdminGeneralTait;
use Capco\AppBundle\Behat\Traits\AdminOpinionTait;
use Capco\AppBundle\Behat\Traits\AdminShieldTrait;
use Capco\AppBundle\Behat\Traits\UserProfileTrait;
use Capco\AppBundle\Behat\Traits\AdminProjectTrait;
use Capco\AppBundle\Behat\Traits\CommentStepsTrait;
use Capco\AppBundle\Behat\Traits\OpinionStepsTrait;
use Capco\AppBundle\Behat\Traits\ProjectStepsTrait;
use Capco\AppBundle\Behat\Traits\SharingStepsTrait;
use Capco\AppBundle\Behat\Traits\AdminDashboardTait;
use Capco\AppBundle\Behat\Traits\ProposalStepsTrait;
use Capco\AppBundle\Behat\Traits\ReportingStepsTrait;
use Capco\AppBundle\Behat\Traits\SynthesisStepsTrait;
use Capco\AppBundle\Behat\Traits\ExportDatasUserTrait;
use Capco\AppBundle\Behat\Traits\AdminOpinionTypeTrait;
use Capco\AppBundle\Behat\Traits\NotificationsStepTrait;
use Capco\AppBundle\Behat\Traits\ProposalEvaluationTrait;
use Capco\AppBundle\Behat\Traits\QuestionnaireStepsTrait;
use Capco\AppBundle\Command\CreateCsvFromProposalStepCommand;

const REPOSITORY_NAME = 'repository_qa';
const SNAPSHOT_NAME = 'snap_qa';

class ApplicationContext extends UserContext
{
    use AdminDashboardTait;
    use AdminEventTrait;
    use AdminGeneralTait;
    use AdminOpinionTait;
    use AdminOpinionTypeTrait;
    use AdminProjectTrait;
    use AdminSectionTrait;
    use AdminShieldTrait;
    use AdminTrait;
    use CommentStepsTrait;
    use ExportDatasUserTrait;
    use LocaleTrait;
    use NotificationsStepTrait;
    use OpinionStepsTrait;
    use ProjectStepsTrait;
    use ProposalEvaluationTrait;
    use ProposalStepsTrait;
    use QuestionnaireStepsTrait;
    use ReportingStepsTrait;
    use SharingStepsTrait;
    use SynthesisStepsTrait;
    use ThemeStepsTrait;
    use UserProfileTrait;

    protected $cookieConsented;
    protected $currentPage = 'home page';
    protected $queues = [];

    /**
     * @BeforeScenario
     */
    public function resetScenario(BeforeScenarioScope $scope)
    {
        // We reset everything
        $jobs = [
            Process::fromShellCommandline('curl -sS -XBAN http://capco.test:8181'),
            Process::fromShellCommandline('redis-cli -h redis FLUSHALL'),
        ];

        $scenario = $scope->getScenario();
        $suite = $scope->getSuite();

        // This tag make sure queues are empty at the begining of a test
        if ($scenario->hasTag('rabbitmq')) {
            $messagesTypes = $this->getParameter('swarrot.messages_types');
            foreach ($messagesTypes as $messageType) {
                $this->queues[] = $messageType['routing_key'];
            }
            $jobs[] = Process::fromShellCommandline(
                'php bin/rabbit vhost:mapping:create --password=' .
                    $this->getParameter('rabbitmq_password') .
                    ' --user=' .
                    $this->getParameter('rabbitmq_login') .
                    ' --vhost=' .
                    $this->getParameter('rabbitmq_vhost') .
                    ' --host=' .
                    $this->getParameter('rabbitmq_host') .
                    ' --erase-vhost config/rabbitmq.yaml'
            );
            $this->purgeRabbitMqQueues();
        }

        // This tag is useful when you analyze the medias folder (e.g: counting number of files)
        // Indeed, we have no way to only copy paste medias because of SonataMediaBundle's workflow.
        // It launch a complete reinit. Use it carefully !
        if ($scenario->hasTag('media')) {
            $jobs[] = Process::fromShellCommandline('rm -rf public/media/*');
            $jobs[] = Process::fromShellCommandline(
                'php -d memory_limit=-1 bin/console capco:reinit --force --env=test'
            );
        }

        foreach ($jobs as $job) {
            echo $job->getCommandLine() . PHP_EOL;
            $job->mustRun();
        }

        $this->snapshot = new Snapshot($this->getService(Client::class));
        $this->snapshot->registerRepository(REPOSITORY_NAME, 'fs', ['location' => 'var']);

        $this->indexManager = $this->getService(IndexBuilder::class);

        try {
            $this->snapshot->deleteSnapshot(REPOSITORY_NAME, SNAPSHOT_NAME);
        } catch (\Elastica\Exception\ResponseException $e) {
            echo 'No ElasticSearch snapshot detected.' . PHP_EOL;
        }
        echo 'Writing ElasticSearch snapshot.' . PHP_EOL;
        // We pass true as string because of php casting true to 1 and this is not authorized in ES 7.
        $this->snapshot->createSnapshot(
            REPOSITORY_NAME,
            SNAPSHOT_NAME,
            ['indices' => $this->indexManager->getLiveSearchIndexName()],
            'true'
        );
        $this->cookieConsented = !$this->isSuiteWithJS($suite);
    }

    /**
     * @AfterScenario
     */
    public function resetRabbitMq()
    {
        $this->purgeRabbitMqQueues();
    }

    /**
     * @AfterScenario
     */
    public function resetExports(AfterScenarioScope $scope)
    {
        if ($scope->getScenario()->hasTag('export')) {
            $job = Process::fromShellCommandline('rm -rf public/export/*');
            echo $job->getCommandLine() . PHP_EOL;
            echo 'Clearing exports...' . PHP_EOL;
            $job->mustRun();
        }
    }

    /**
     * @AfterScenario
     */
    public function resetDatabase(AfterScenarioScope $scope)
    {
        $scenario = $scope->getScenario();
        if ($scenario->hasTag('database')) {
            $job = Process::fromShellCommandline(
                'mysql -h database -u root symfony < var/db.backup'
            );
            echo $job->getCommandLine() . PHP_EOL;
            $job->mustRun();
        }

        echo 'Restoring ElasticSearch snapshot.' . PHP_EOL;
        $indexManager = $this->getService(IndexBuilder::class);
        $indexManager->getLiveSearchIndex()->close();
        $this->snapshot->restoreSnapshot(REPOSITORY_NAME, SNAPSHOT_NAME, [], true);
        $indexManager->getLiveSearchIndex()->open();
        $indexManager->markAsLive($indexManager->getLiveSearchIndex());
    }

    /**
     * Close only the first window because Mink loose the connection if we close it all.
     */
    public function closeWindows(AfterScenarioScope $scope): void
    {
        $scenario = $scope->getScenario();
        if ($scenario->hasTags('multiple-windows')) {
            /** @var Session $session */
            $session = $this->getSession();
            $windowsNames = $session->getWindowNames();
            $session->stop(array_pop($windowsNames));
        }
    }

    /**
     * @BeforeScenario
     */
    public function maximizeWindow(BeforeScenarioScope $scope)
    {
        if (!$this->isSuiteWithJS($scope->getSuite())) {
            return;
        }
        $driver = $this->getSession()->getDriver();
        if (!$driver instanceof Selenium2Driver) {
            return;
        }

        try {
            $driver->maximizeWindow();
        } catch (\Exception $e) {
            if (
                Text::startsWith(
                    $e->getMessage(),
                    'unknown error: failed to change window state to maximized, current state is normal'
                )
            ) {
                echo 'Failed to maximizeWindow';
            } else {
                throw $e;
            }
        }
    }

    /**
     * @Given I visited :pageName
     */
    public function iVisitedPage(string $pageName, bool $cookiesConsent = true)
    {
        $this->navigationContext->iVisitedPage($pageName);
        $this->currentPage = $pageName;
        if ($cookiesConsent) {
            $this->setCookieConsent();
        }
    }

    /**
     * @Given I visited :pageName with cookies not accepted
     */
    public function iVisitedPageWithCookiesNotAccepted(string $pageName)
    {
        $this->iVisitedPage($pageName, false);
    }

    /**
     * @Then I should see :filename file in :directory directory
     */
    public function iShouldSeeFileInDirectory(string $filename, string $directory)
    {
        // Make sure we are not using virtual file system, because here we want to see real files in path
        $directory = str_replace('vfs://', '', rtrim($directory, '/\\'));
        $filename = str_replace('vfs://', '', $filename);
        Assert::assertFileExists("${directory}/${filename}");
    }

    /**
     * @When I reload the page, I should see a confirm popup
     */
    public function iConfirmThePopup()
    {
        $this->getSession()->reload();

        // https://stackoverflow.com/questions/39646444/how-to-handle-a-javascript-alert-window-using-php-behat-mink-selenium2-chrome-we
        $session = $this->getSession()
            ->getDriver()
            ->getWebDriverSession();
        // See message with $session->getAlert_text()
        $session->accept_alert();
    }

    /**
     * @Given I should see the shield
     */
    public function iShouldSeeTheShield()
    {
        $this->assertSession()->elementExists('css', '#shield-mode');
    }

    /**
     * @Given I should not see the shield
     */
    public function iShouldNotSeeTheShield()
    {
        $this->assertSession()->elementNotExists('css', '#shield-mode');
    }

    /**
     * @Given I visited :pageName with:
     *
     * @param mixed $pageName
     */
    public function iVisitedPageWith($pageName, TableNode $parameters)
    {
        $this->navigationContext->iVisitedPageWith($pageName, $parameters);
        $this->setCookieConsent();
    }

    /**
     * @AfterScenario
     */
    public function clearLocalStorage(AfterScenarioScope $scope): void
    {
        if (!$this->isSuiteWithJS($scope->getSuite())) {
            return;
        }

        $driver = $this->getSession()->getDriver();

        try {
            $driver->evaluateScript('window.sessionStorage.clear();');
            $driver->evaluateScript('window.localStorage.clear();');
        } catch (\Exception $e) {
            echo 'Failed to clear localStorage !' . PHP_EOL;
        }

        $this->closeWindows($scope);
    }

    /**
     * @AfterSuite
     */
    public static function notifyEnd(AfterSuiteScope $suiteScope)
    {
        $suiteName = $suiteScope->getSuite()->getName();
        $resultCode = $suiteScope->getTestResult()->getResultCode();

        $job = Process::fromShellCommandline('redis-cli -h redis FLUSHALL');
        echo $job->getCommandLine() . PHP_EOL;
        echo 'Reset feature flag...' . PHP_EOL;
        $job->mustRun();

        if ($notifier = NotifierFactory::create()) {
            $notification = new Notification();
            if (TestResult::PASSED === $resultCode) {
                $notification
                    ->setTitle('Behat suite ended successfully')
                    ->setBody(
                        'Suite "' . $suiteName . '" has ended without errors (for once). Congrats !'
                    );
            } elseif (TestResult::SKIPPED === $resultCode) {
                $notification
                    ->setTitle('Behat suite ended with skipped steps')
                    ->setBody(
                        'Suite "' .
                            $suiteName .
                            '" has ended successfully but some steps have been skipped.'
                    );
            } else {
                $notification
                    ->setTitle('Behat suite ended with errors')
                    ->setBody(
                        'Suite "' .
                            $suiteName .
                            '" has ended with errors. Go check it out you moron !'
                    );
            }
            $notifier->send($notification);
        }
    }

    /**
     * @Then I should be redirected to :url
     * @Then I should be redirected to :url within :timeout seconds
     */
    public function assertRedirect(string $url, int $timeout = 10): void
    {
        while (true) {
            try {
                $this->assertPageAddress($url);

                return;
            } catch (ExpectationException $exception) {
                if ($timeout <= 0) {
                    throw $exception;
                }
            }
            --$timeout;
            sleep(1);
        }

        throw new \RuntimeException("Redirect URL didn't match expected URL.");
    }

    /**
     * @Then I should not be redirected to :url
     */
    public function assertNotRedirect(string $url)
    {
        $this->iWait(1);

        $this->assertSession()->addressNotEquals($this->locatePath($url));
    }

    /**
     * @Given enable sso provider :ssoName
     */
    public function oauth2SSOIsSetToEnabled(string $ssoName)
    {
        $entityManager = $this->getEntityManager();
        $oauth2Repository = $entityManager->getRepository(Oauth2SSOConfiguration::class);
        $ssoConfig = $oauth2Repository->find($ssoName);
        if (null === $ssoConfig) {
            throw new \RuntimeException('Cannot find Oauth2SSOConfiguration');
        }
        $ssoConfig->setEnabled(true);
        $entityManager->persist($ssoConfig);
        $entityManager->flush();
        $entityManager->clear();
    }

    /**
     * @Then I set currentDate as the start event date for event :eventId
     */
    public function setStartDateForEvent(string $eventId)
    {
        $entityManager = $this->getEntityManager();
        $eventRepository = $entityManager->getRepository(Event::class);
        /** @var Event $event */
        $event = $eventRepository->find($eventId);
        if (null === $event) {
            throw new \RuntimeException('Cannot find event ' . $eventId);
        }
        $currentDate = new \DateTime();
        $currentDate->sub(new \DateInterval('PT1H'));
        $event->setStartAt($currentDate);
        $entityManager->persist($event);
        $entityManager->flush();
        $entityManager->clear();
    }

    /**
     * @Given all features are enabled
     */
    public function allFeaturesAreEnabled()
    {
        $this->getService(Manager::class)->activateAll();
    }

    /**
     * @Given feature :featureA is enabled
     * @Given features :featureA, :featureB are enabled
     * @Given features :featureA, :featureB, :featureC are enabled
     * @Given features :featureA, :featureB, :featureC, :featureD are enabled
     * @Given features :featureA, :featureB, :featureC, :featureD, :featureE are enabled
     */
    public function activateFeatures(
        string $featureA,
        ?string $featureB = null,
        ?string $featureC = null,
        ?string $featureD = null,
        ?string $featureE = null
    ) {
        $this->getService(Manager::class)->activate($featureA);
        if ($featureB) {
            $this->getService(Manager::class)->activate($featureB);
            if ($featureC) {
                $this->getService(Manager::class)->activate($featureC);
            }
            if ($featureD) {
                $this->getService(Manager::class)->activate($featureD);
            }
            if ($featureE) {
                $this->getService(Manager::class)->activate($featureE);
            }
        }
    }

    /**
     * @Given I disable feature :featureA
     * @Given I disable features :featureA, :featureB
     * @Given I disable features :featureA, :featureB, :featureC
     * @Given I disable features :featureA, :featureB, :featureC, :featureD
     * @Given I disable features :featureA, :featureB, :featureC, :featureD, :featureE
     */
    public function deactivateFeatures(
        string $featureA,
        ?string $featureB = null,
        ?string $featureC = null,
        ?string $featureD = null,
        ?string $featureE = null
    ) {
        $this->getService(Manager::class)->deactivate($featureA);
        if ($featureB) {
            $this->getService(Manager::class)->deactivate($featureB);
            if ($featureC) {
                $this->getService(Manager::class)->deactivate($featureC);
            }
            if ($featureD) {
                $this->getService(Manager::class)->deactivate($featureD);
            }
            if ($featureE) {
                $this->getService(Manager::class)->deactivate($featureE);
            }
        }
    }

    /**
     * @Given feature :featureA should be enabled
     */
    public function featureIsEnabled(string $feature)
    {
        $toggleManager = $this->getService('qandidate.toggle.manager');
        $contextFactory = $this->getService('qandidate.toggle.user_context_factory');
        expect($toggleManager->active($feature, $contextFactory->createContext()))->toBe(true);
    }

    /**
     * @When I set my locale to :locale
     */
    public function iSetMyCurrentLocaleTo(string $locale)
    {
        $localePath = substr($locale, 0, strpos($locale, '-'));
        $this->visitPath("/${localePath}");
    }

    /**
     * @Given default locale is set to :locale
     */
    public function defaultLocaleIsSetTo(string $locale): void
    {
        $newDefaultLocale = $this->getEntityManager()
            ->getRepository(Locale::class)
            ->findOneByCode($locale);
        if (null === $newDefaultLocale || !$newDefaultLocale->isPublished()) {
            throw new RuntimeException("cannot set ${locale} as default locale");
        }
        $oldDefaultLocale = $this->getEntityManager()
            ->getRepository(Locale::class)
            ->findDefaultLocale();
        $oldDefaultLocale->unsetDefault();
        $newDefaultLocale->setDefault();

        $this->getEntityManager()->flush();
    }

    /**
     * @Given feature :featureA is disabled
     * @Given feature :featureA should be disabled
     */
    public function featureIsDisabled(string $feature)
    {
        $toggleManager = $this->getService('qandidate.toggle.manager');
        $contextFactory = $this->getService('qandidate.toggle.user_context_factory');
        expect($toggleManager->active($feature, $contextFactory->createContext()))->toBe(false);
    }

    /**
     * @When I print html
     */
    public function printHtml()
    {
        echo $this->getSession()
            ->getPage()
            ->getHtml();
    }

    /**
     * @Then I should see :element on :page
     */
    public function iShouldSeeElementOnPage(string $element, string $page)
    {
        expect($this->navigationContext->getPage($page)->containsElement($element))->toBe(true);
    }

    /**
     * @Then I should not see :element on :page
     */
    public function iShouldNotSeeElementOnPage(string $element, string $page)
    {
        expect($this->navigationContext->getPage($page)->containsElement($element))->toBe(false);
    }

    /**
     * @Then I should see :element on :page disabled
     */
    public function iShouldSeeElementOnPageDisabled(string $element, string $pageSlug)
    {
        $page = $this->navigationContext->getPage($pageSlug);
        $this->waitAndThrowOnFailure(2000, "$('" . $page->getSelector($element) . "').length > 0");
        expect($page->getElement($element)->hasAttribute('disabled'))->toBe(true);
    }

    /**
     * @Then I should see :text appear on current page in :selector
     * @Then I wait :text to appear on current page in :selector
     * @Then I wait :text to appear on current page in :selector maximum :timeout
     */
    public function iWaitTextToAppearOnPage(
        string $text,
        string $selector = 'body',
        int $timeout = 10000
    ) {
        $text = "'${text}'";
        $this->waitAndThrowOnFailure(
            $timeout,
            '$("' . $selector . ':contains(' . $text . ')").length > 0'
        );
    }

    /**
     * @Then I wait :text to disappear on current page in :selector
     * @Then I wait :text to disappear on current page in :selector maximum :timeout
     */
    public function iWaitTextToDisappearOnPage(
        string $text,
        string $selector = 'body',
        int $timeout = 10000
    ) {
        $text = "'${text}'";
        $this->waitAndThrowOnFailure(
            $timeout,
            '$("' . $selector . ':contains(' . $text . ')").length == 0'
        );
    }

    /**
     * @Then I wait :selector to appear on current page
     * @Then I wait :selector to appear on current page maximum :timeout
     */
    public function iWaitElementToAppearOnPage(string $selector, int $timeout = 10)
    {
        $timeout = $timeout * 1000;

        $this->waitAndThrowOnFailure($timeout, '$("' . $selector . '").length > 0');
    }

    /**
     * @Then I wait :selector to disappear on current page
     * @Then I wait :selector to disappear on current page maximum :timeout
     */
    public function iWaitElementToDisappearOnPage(string $selector, int $timeout = 10000)
    {
        $this->iWaitElementToAppearExactlyNb($selector, 0, $timeout);
    }

    /**
     * @Then I wait :selector to appear on current page :nb times
     * @Then I wait :selector to appear on current page :nb times maximum :timeout
     */
    public function iWaitElementToAppearExactlyNb(string $selector, int $nb, int $timeout = 10000)
    {
        try {
            $this->waitAndThrowOnFailure($timeout, '$("' . $selector . '").length == ' . $nb);
        } catch (\RuntimeException $exception) {
            $this->assertSession()->elementsCount('css', $selector, $nb);
        }
    }

    /**
     * @Then :first should be before :second for selector :cssQuery
     *
     * @param mixed $first
     * @param mixed $second
     */
    public function element1ShouldBeBeforeElement2ForSelector($first, $second, string $cssQuery)
    {
        $items = array_map(
            function ($element) {
                return $element->getText();
            },
            $this->getSession()
                ->getPage()
                ->findAll('css', $cssQuery)
        );
        if (!\in_array($first, $items, true)) {
            throw new ElementNotFoundException($this->getSession(), 'Element "' . $first . '"');
        }
        if (!\in_array($second, $items, true)) {
            throw new ElementNotFoundException($this->getSession(), 'Element "' . $second . '"');
        }
        Assert::assertTrue(
            array_search($first, $items, true) < array_search($second, $items, true)
        );
    }

    /**
     * @When I click the :selector element
     */
    public function iClickElement(string $selector)
    {
        $this->iWaitElementToAppearOnPage($selector);
        $element = $this->getSession()
            ->getPage()
            ->find('css', $selector);
        if (null === $element) {
            throw new ElementNotFoundException($this->getSession(), 'element', 'css', $selector);
        }
        $element->click();
    }

    /**
     * @When I select the first :number checkboxes in list :list
     */
    public function iSelectTheFirstNElements(string $number, string $list)
    {
        $list .= ' input[type=checkbox]';
        $driver = $this->getSession()->getDriver();
        for ($i = 0; $i < $number; ++$i) {
            $driver->executeScript("$('${list}')[${i}].click();");
        }
    }

    /**
     * @When I trigger element :element with action :action
     */
    public function iTriggerElementWithAction($element, $action)
    {
        $this->getSession()
            ->getDriver()
            ->executeScript("$('${element}').trigger('${action}');");
    }

    /**
     * @When I hover over the :selector element
     */
    public function iHoverOverTheElement(string $selector)
    {
        $this->iWaitElementToAppearOnPage($selector);
        $element = $this->getSession()
            ->getPage()
            ->find('css', $selector);

        if (null === $element) {
            throw new ElementNotFoundException($this->getSession(), 'element', 'css', $selector);
        }

        $element->mouseOver();
    }

    /**
     * @When I focus the :selector element
     */
    public function iFocusTheElement(string $selector)
    {
        $this->iWaitElementToAppearOnPage($selector);
        $element = $this->getSession()
            ->getPage()
            ->find('css', $selector);

        if (null === $element) {
            throw new ElementNotFoundException($this->getSession(), 'element', 'css', $selector);
        }

        $element->focus();
    }

    /**
     * @When I fill the element :element with empty value
     */
    public function ifillElementWithEmptyValue(string $element)
    {
        $this->iWaitElementToAppearOnPage($element);

        $element = $this->getSession()
            ->getPage()
            ->find('css', $element);

        $element->setValue('');
    }

    /**
     * @When I fill the element :element with value :value
     */
    public function ifillElementWithValue(string $element, string $value)
    {
        $this->iWaitElementToAppearOnPage($element);

        $element = $this->getSession()
            ->getPage()
            ->find('css', $element);

        $element->setValue($value);
    }

    /**
     * Fills in form field with specified id|name|label|value.
     * Overrided to fill wysiwyg fields as well.
     *
     * @param mixed $value
     * @param mixed $field
     */
    public function fillField($field, $value)
    {
        $field = $this->fixStepArgument($field);
        $value = $this->fixStepArgument($value);

        try {
            $this->getSession()
                ->getPage()
                ->fillField($field, $value);
        } catch (ElementNotFoundException $e) {
            // Try to get corresponding wysiwyg field
            // Works only with quill editor for now
            $wrapper = $this->getSession()
                ->getPage()
                ->find('named', ['id_or_name', $field]);
            if (!$wrapper || !$wrapper->hasClass('editor') || !$wrapper->has('css', '.ql-editor')) {
                throw $e;
            }
            $field = $wrapper->find('css', '.ql-editor');
            $field->setValue($value);
        } catch (ElementNotVisible $e) {
            // Ckeditor case
            $wrapper = $this->getSession()
                ->getPage()
                ->find('named', ['id_or_name', 'cke_' . $field]);
            if (!$wrapper || !$wrapper->hasClass('cke')) {
                throw $e;
            }
            $this->getSession()
                ->getDriver()
                ->executeScript(
                    '
                CKEDITOR.instances["' .
                        $field .
                        '"].setData("' .
                        $value .
                        '");
            '
                );
        }
    }

    /**
     * @When The field :field should be disabled
     */
    public function theFieldShouldBeDisabled($field)
    {
        $page = $this->getCurrentPage();
        $field = $this->fixStepArgument($field);

        $element = $page->find('css', $field);

        Assert::assertTrue($element->hasAttribute('disabled'));
    }

    /**
     * @When The field :field should be enabled
     */
    public function theFieldShouldBeEnabled($field)
    {
        $page = $this->getCurrentPage();
        $field = $this->fixStepArgument($field);

        $element = $page->find('css', $field);

        Assert::assertFalse($element->hasAttribute('disabled'));
    }

    /**
     * @When I wait :seconds seconds
     */
    public function iWait(int $seconds)
    {
        try {
            $this->getSession()->wait((int) ($seconds * 1000));
        } catch (\RuntimeException $exception) {
            sleep($seconds);
        }
    }

    /**
     * @When I scroll to element :selector
     */
    public function scrollToElement(string $selector)
    {
        $this->getSession()
            ->getDriver()
            ->executeScript("document.querySelector('${selector}').scrollIntoView()");
    }

    /**
     * @When I check element :value
     */
    public function checkElement(string $value)
    {
        $input = "[name='${value}'], [value='${value}'], [id='${value}']";

        $inputId = $this->getSession()
            ->getPage()
            ->find('css', $input)
            ->getAttribute('id');

        $this->checkElementWithId($inputId);
    }

    /**
     * @When I click on label for :inputId to check custom element
     */
    public function checkElementWithId(string $inputId)
    {
        $selector = "[for='${inputId}']";
        $this->iWaitElementToAppearOnPage($selector);

        $element = $this->getSession()
            ->getPage()
            ->find('css', $selector);
        if (null === $element) {
            throw new ElementNotFoundException($this->getSession(), 'element', 'css', $selector);
        }
        $element->click();
    }

    /**
     * @Then I should see :text as label of the option number :number of the react element :element
     */
    public function iShouldSeeAsLabelOfTheOptionOfTheReactElement(
        string $text,
        int $number,
        string $element
    ): void {
        $this->assertSession()->elementTextContains(
            'css',
            "${element} .react-select__value-container .react-select__multi-value:nth-child(${number}) .react-select__multi-value__label",
            $this->fixStepArgument($text)
        );
    }

    /**
     * @Then I remove the number :number option of the react element :element
     */
    public function iRemoveTheOptionOfTheReactElement(int $number, string $element): void
    {
        $selector = "${element} .react-select__value-container .react-select__multi-value:nth-child(${number}) .react-select__multi-value__remove";
        $this->iWaitElementToAppearOnPage($selector);

        $element = $this->getSession()
            ->getPage()
            ->find('css', $selector);
        if (null === $element) {
            throw new ElementNotFoundException($this->getSession(), 'element', 'css', $selector);
        }
        $element->click();
    }

    /**
     * @Given /^I wait for debug$/
     */
    public function iWaitForDebug()
    {
        $this->iWait(1000);
    }

    /**
     * @When I try to download :path
     */
    public function iTryToDownload(string $path)
    {
        // Fix SSL problem.
        stream_context_set_default([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
            ],
        ]);

        $url = 'https://capco.test' . $path;
        $this->headers = get_headers($url);
        $this->getSession()->visit($url);
    }

    /**
     * @When I download file at :path
     */
    public function iDownloadFile(string $path)
    {
        // Fix SSL problem.
        stream_context_set_default([
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
            ],
        ]);

        $url = 'https://capco.test' . $path;
        $this->headers = get_headers($url);
        $this->getSession()->visit($url);
        $this->assertSession()->pageTextNotContains($this->fixStepArgument('error.404.title'));
        $this->assertSession()->elementTextNotContains(
            'css',
            '#symfony-flash-messages',
            $this->fixStepArgument('file.not-found')
        );
    }

    /**
     * @When I can download :format export for project :projectSlug and step :stepSlug
     */
    public function iCanDownload(string $format, string $projectSlug, string $stepSlug)
    {
        // Simulate a generated export, in production export
        // are written by crons
        $fileName = CreateCsvFromProposalStepCommand::getShortenedFilename(
            $projectSlug . '_' . $stepSlug,
            '.' . $format
        );
        file_put_contents('/var/www/public/export/' . $fileName, '');

        $url = $this->getService('router')->generate('app_project_download', [
            'projectSlug' => $projectSlug,
            'stepSlug' => $stepSlug,
        ]);
        $this->iDownloadFile($url);
    }

    /**
     * @When I can download participant :format export for step :stepId with slug :stepSlug
     */
    public function iCanDownloadParticipantExport(string $format, string $stepId, string $stepSlug)
    {
        $fileName = CreateStepContributorsCommand::getShortenedFilename(
            'participants_' . $stepSlug,
            '.' . $format
        );
        file_put_contents('/var/www/public/export/' . $fileName, '');

        $url = $this->getService('router')->generate('app_export_step_contributors', [
            'stepId' => $stepId,
        ]);
        $this->iDownloadFile($url);
    }

    /**
     * @When I can download event participant export with eventId :eventId and eventSlug :eventSlug
     */
    public function iCanDownloadEventParticipantsExport(string $eventId, string $eventSlug)
    {
        $fileName = CreateCsvFromEventParticipantsCommand::getFilename($eventSlug);
        file_put_contents('/var/www/public/export/' . $fileName, '');

        $url = $this->getService('router')->generate('app_export_my_event_participants', [
            'eventId' => $eventId,
        ]);
        $this->iDownloadFile($url);
    }

    /**
     * @When I can download analysis export with project slug :projectSlug
     */
    public function iCanDownloadAnalysisExport(string $projectSlug)
    {
        $fileName = ExportAnalysisCSVCommand::getFilename($projectSlug, false);
        file_put_contents('/var/www/public/export/' . $fileName, '');

        $url = $this->getService('router')->generate('app_project_analysis_download', [
            'projectSlug' => $projectSlug,
        ]);
        $this->iDownloadFile($url);
    }

    /**
     * @When I can download decision export with project slug :projectSlug
     */
    public function iCanDownloadDecisionExport(string $projectSlug)
    {
        $fileName = ExportAnalysisCSVCommand::getFilename($projectSlug, true);
        file_put_contents('/var/www/public/export/' . $fileName, '');

        $url = $this->getService('router')->generate('app_project_decisions_download', [
            'projectSlug' => $projectSlug,
        ]);
        $this->iDownloadFile($url);
    }

    /**
     * @When I can download project contributor export with project slug :projectSlug and projectId :projectId
     */
    public function iCanDownloadProjectContributorsExport(string $projectSlug, string $projectId)
    {
        $fileName = CreateCsvFromProjectsContributorsCommand::getFilename($projectSlug);
        file_put_contents('/var/www/public/export/' . $fileName, '');

        $url = $this->getService('router')->generate('app_export_project_contributors', [
            'projectId' => $projectId,
        ]);
        $this->iDownloadFile($url);
    }

    /**
     * @Then /^I create a cookie named "([^"]*)"$/
     */
    public function iCreateACookieNamed(string $cookieName)
    {
        $this->getSession()->setCookie($cookieName, 'test');
    }

    /**
     * @Then /^I should see a cookie named "([^"]*)"$/
     */
    public function iShouldSeeCookieNamed(string $cookieName)
    {
        Assert::assertTrue(null !== $this->getSession()->getCookie($cookieName));
    }

    /**
     * @Then /^I should not see a cookie named "([^"]*)"$/
     */
    public function iShouldNotSeeCookieNamed(string $cookieName)
    {
        Assert::assertTrue(null === $this->getSession()->getCookie($cookieName));
    }

    /**
     * @Then I select :locale in the language header
     */
    public function iSelectLocaleInTheLanguageHeader(string $locale)
    {
        $this->iWaitElementToAppearOnPage('#changeLanguageProposalContainer');
        $this->iClickElement('#language-change-caret');
        $this->iClickElement("#language-choice-${locale}");
        $this->iClickElement('#language-header-continue-button');
        $this->iWaitElementToDisappearOnPage('#changeLanguageProposalContainer');
        $this->iWaitElementToAppearOnPage('#main-navbar-toggle');
    }

    /**
     * @Then I select :locale in the language footer
     */
    public function iSelectLocaleInTheLanguageFooter(string $locale): void
    {
        $this->iWaitElementToAppearOnPage('#language-change-button-dropdown');
        $this->iWaitElementToAppearOnPage('#footer-links #language-change-caret');
        $this->iClickElement('#footer-links #language-change-caret');
        $this->iWaitElementToAppearOnPage("#footer-links #language-choice-${locale}");
        $this->iClickElement("#footer-links #language-choice-${locale}");
    }

    /**
     * Checks if an element has a class
     * Copyright neemzy https://github.com/neemzy/patchwork-core.
     *
     * @Then /^"([^"]*)" element should have class "([^"]*)"$/
     */
    public function elementShouldHaveClass(string $selector, string $class)
    {
        $session = $this->getSession();
        $page = $session->getPage();
        $element = $page->find('css', $selector);
        if (!$element) {
            throw new ElementNotFoundException($session, 'Element "' . $selector . '"');
        }
        Assert::assertTrue($element->hasClass($class));
    }

    /**
     * Checks if an element doesn't have a class
     * Copyright neemzy https://github.com/neemzy/patchwork-core.
     *
     * @Then /^"([^"]*)" element should not have class "([^"]*)"$/
     */
    public function elementShouldNotHaveClass(string $selector, string $class)
    {
        $session = $this->getSession();
        $page = $session->getPage();
        $this->iWaitElementToAppearOnPage($selector);

        $element = $page->find('css', $selector);
        if (!$element) {
            throw new ElementNotFoundException($session, 'Element "' . $selector . '"');
        }
        Assert::assertFalse($element->hasClass($class));
    }

    /**
     * @Then /^the button "([^"]*)" should be disabled$/
     */
    public function buttonShouldBeDisabled(string $locator)
    {
        $locator = $this->fixStepArgument($locator);
        $button = $this->getSession()
            ->getPage()
            ->findButton($locator);

        if (null === $button) {
            throw new ElementNotFoundException(
                $this->getSession(),
                'button',
                'id|name|title|alt|value',
                $locator
            );
        }

        Assert::assertTrue($button->hasAttribute('disabled'));
    }

    /**
     * @Then /^the button "([^"]*)" should not be disabled$/
     */
    public function buttonShouldNotBeDisabled(string $locator)
    {
        $locator = $this->fixStepArgument($locator);
        $button = $this->getSession()
            ->getPage()
            ->findButton($locator);

        if (null === $button) {
            throw new ElementNotFoundException(
                $this->getSession(),
                'button',
                'id|name|title|alt|value',
                $locator
            );
        }

        Assert::assertFalse($button->hasAttribute('disabled'));
    }

    /**
     * Checks that an element has an attribute.
     *
     * @Then /^The element "([^"]*)" should have attribute :attribute $/
     *
     * @param mixed $selector
     * @param mixed $attribute
     */
    public function theElementHasAttribute($selector, $attribute)
    {
        $this->iWaitElementToAppearOnPage($selector);

        $element = $this->getSession()
            ->getPage()
            ->find('css', $selector);

        if (null === $element) {
            throw new ElementNotFoundException($this->getSession(), 'element', 'css', $selector);
        }

        Assert::assertTrue($element->hasAttribute($attribute));
    }

    /**
     * @override Given /^(?:|I )am on (?:|the )homepage$/
     * @override When /^(?:|I )go to (?:|the )homepage$/
     */
    public function iAmOnHomepage()
    {
        $this->visitPageWithParams('home page');
    }

    /**
     * @When I set cookie consent
     */
    public function setCookieConsent()
    {
        if ($this->cookieConsented) {
            return;
        }
        $isPresent = $this->getSession()->wait(
            2000,
            "document.getElementById('cookie-banner') != null"
        );
        if (!$isPresent) {
            // No cookie banner is present.
            return;
        }
        $isBannerVisible = $this->getSession()->evaluateScript(
            "document.getElementById('cookie-banner').classList.contains('active')"
        );
        if ($isBannerVisible) {
            $this->iClickElement('#cookie-consent');
        }
        $this->cookieConsented = true;
    }

    /**
     * @Given I disable toggle :value
     *
     * @param mixed $value
     */
    public function iDisableElement($value)
    {
        $input = ".checked[for='${value}']";

        $inputId = $this->getSession()
            ->getPage()
            ->find('css', $input);

        if (null !== $inputId) {
            $this->checkElement($value);
        }
    }

    /**
     * @Given I enable toggle :value
     *
     * @param mixed $value
     */
    public function iEnableElement($value)
    {
        $input = ".unchecked[for='${value}']";

        $inputId = $this->getSession()
            ->getPage()
            ->find('css', $input);

        if (null !== $inputId) {
            $this->checkElement($value);
        }
    }

    /**
     * @Then The element :element should be disabled
     *
     * @param mixed $element
     */
    public function theElementShouldBeDisabled($element)
    {
        $input = $this->getSession()
            ->getPage()
            ->find('css', $element);

        Assert::assertTrue($input->hasAttribute('disabled'));
    }

    /**
     * @Then the number :number element in :list should contain :value
     */
    public function assertListElementContains($number, $list, $value)
    {
        $elements = $this->getSession()
            ->getPage()
            ->findAll('css', $list);
        $element = $elements[$number - 1];
        Assert::assertContains($element->getText(), $value);
    }

    /**
     * @When I scroll to the bottom
     */
    public function iScrollBot()
    {
        $this->scrollTo('bot');
    }

    /**
     * @When I scroll to the top
     */
    public function iScrollTop()
    {
        $this->scrollTo('top');
    }

    /**
     * Selects option in select created by our react Field component with specified id.
     *
     * Example: When I select "Bats" from react "#user_fears"
     * Example: And I select "Bats" from  react "#user_fears".
     *
     * @When /^(?:|I )select "(?P<option>(?:[^"]|\\")*)" from react "(?P<select>(?:[^"]|\\")*)"$/
     */
    public function selectOptionFromReact(string $select, string $option): void
    {
        $selector = "${select} .react-select__input input";
        $element = $this->getSession()
            ->getPage()
            ->find('css', $selector);

        if (null === $element) {
            throw new ElementNotFoundException($this->getSession(), 'element', 'css', $selector);
        }

        $element->setValue($option);
        $this->iWait(3);
    }

    /**
     * Checks that option from select is selected.
     *
     * @Then the option :option from :select should be selected
     */
    public function checkSelectAccessibleOption(string $select, string $option): void
    {
        $selector = "${select}-button";

        $this->iWaitElementToAppearOnPage($selector);
        $element = $this->getSession()
            ->getPage()
            ->find('css', $selector);

        Assert::assertEquals($element->getText(), $option);
    }

    /**
     * @Then The element :element should contain :number sub-elements
     *
     * @param mixed $element
     */
    public function checkCountChildren($element, $number): void
    {
        $container = $this->getSession()
            ->getPage()
            ->find('css', $element);
        $children = $container->findAll('xpath', './span');
        $count = 0;
        foreach ($children as $child) {
            ++$count;
        }
        Assert::assertEquals($number, $count);
    }

    /**
     * @When /^(?:|I )search "(?P<text>(?:[^"]|\\")*)" in list "(?P<list>(?:[^"]|\\")*)"$/
     */
    public function iSearchTextInList(string $text, string $list): void
    {
        $this->iClickOnButton('#load-more');
        $this->iWait(1);

        try {
            $this->assertElementContainsText($list, $text);
        } catch (\Exception $exception) {
            $this->iSearchTextInList($text, $list);
        }
    }

    /**
     * @When I select :select with option :option
     *
     * @param mixed $element
     * @param mixed $value
     */
    public function selectOptionAccessible(string $select, string $option): void
    {
        $selector = "${select} .select__option button[value=${option}]";
        $this->iClickElement($selector);
    }

    /**
     * @When I fill the theme filter with value :value
     */
    public function iFillThemeFilterWithValue($value)
    {
        $this->waitAndThrowOnFailure(3000, "$('#SelectTheme-filter-theme').length > 0");

        $node = $this->getCurrentPage()->find(
            'css',
            '#SelectTheme-filter-theme .react-select__input input'
        );

        $node->setValue($value);
        $node->keyPress(13);

        $this->getSession()->wait(10);
    }

    /**
     * @When I fill the project filter with value :value
     */
    public function iFillProjectFilterWithValue($value)
    {
        $this->waitAndThrowOnFailure(3000, "$('#SelectProject-filter-project').length > 0");

        $node = $this->getCurrentPage()->find(
            'css',
            '#SelectProject-filter-project .react-select__input input'
        );

        $node->setValue($value);
        $node->keyPress(13);

        $this->getSession()->wait(10);
    }

    /**
     * @When I fill the date field
     */
    public function iFillDateField()
    {
        $calendar = $this->getSession()
            ->getPage()
            ->find('css', '.rdt');
        if (null === $calendar) {
            throw new ElementNotFoundException($this->getSession(), 'calendar', 'css', '.rdt');
        }
        $calendar->click();
        $day = $this->getSession()
            ->getPage()
            ->find('css', '.rdtToday');
        if (null === $day) {
            throw new ElementNotFoundException($this->getSession(), 'day', 'css', '.rdtToday');
        }
        $day->click();
    }

    /**
     * @When I fill the date field in :selector
     */
    public function iFillDateFieldIn($selector)
    {
        $calendar = $this->getSession()
            ->getPage()
            ->find('css', "${selector} .rdt");
        if (null === $calendar) {
            throw new ElementNotFoundException($this->getSession(), 'calendar', 'css', '.rdt');
        }
        $calendar->click();
        $day = $this->getSession()
            ->getPage()
            ->find('css', '.rdtToday');
        if (null === $day) {
            throw new ElementNotFoundException($this->getSession(), 'day', 'css', '.rdtToday');
        }
        $day->click();
    }

    private function isSuiteWithJS(Suite $suite): bool
    {
        return \in_array($suite->getName(), [
            'randomly-failing',
            'sso',
            'questionnaire',
            'bo-moderation',
            'core-features',
            'consultation',
            'bo-parameter',
            'bo-content',
            'bo-project',
            'core-pages',
            'core-user',
            'bp-search',
            'bo-pages',
            'bp-crud',
            'bp',
        ]);
    }

    private function visitPageWithParams($page, array $params = [], bool $cookiesConsent = true)
    {
        $this->currentPage = $page;
        $this->navigationContext->getPage($page)->open($params);
        if ($cookiesConsent) {
            $this->setCookieConsent();
        }
    }

    private function getCurrentPage(): ?DocumentElement
    {
        if ($this->currentPage) {
            return $this->navigationContext->getPage($this->currentPage);
        }
    }

    private function purgeRabbitMqQueues()
    {
        try {
            $swarrot = $this->getContainer()->get('swarrot.factory.default');
            foreach ($this->queues as $queue) {
                if ($q = $swarrot->getQueue($queue, 'rabbitmq')) {
                    $q->purge();
                }
            }
        } catch (\Exception $exception) {
            echo $exception->getMessage();
        }
    }

    private function moveDraggableElementTo($element, $key)
    {
        // http://keycode.info/
        $spaceBar = 32;
        $page = $this->getCurrentPage();
        $element = $page->find('css', $element);
        $element->keyDown($spaceBar);
        $element->keyPress($spaceBar);
        $element->keyDown($key);
        $element->keyPress(0);
        $this->iWait(1);
        $element->keyUp($key);
        $element->keyUp($spaceBar);
        // press spacebar again to validate
        $element->keyDown($spaceBar);
        $element->keyPress($spaceBar);
        $element->keyUp($spaceBar);
    }

    private function scrollTo(string $direction = 'bot')
    {
        // http://keycode.info/
        // pageDown = 34
        $key = 34;
        if ('top' == $direction) {
            $key = 33;
        }

        $page = $this->getCurrentPage();
        $element = $page->find('css', 'body');
        $element->keyDown($key);
        $element->keyPress($key);
        $element->keyUp($key);
    }
}
