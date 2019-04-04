<?php

namespace Capco\AppBundle\Command;

use Capco\AppBundle\Notifier\UserNotifier;
use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Helper\ConvertCsvToArray;
use League\Csv\Writer;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Repository\RegistrationFormRepository;

class CreateUserAccountsFromCSVCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this->setName('capco:create-users-account-from-csv')
            ->addArgument(
                'input',
                InputArgument::REQUIRED,
                'Please provide the path of the file you want to use.'
            )
            ->addArgument(
                'output',
                InputArgument::REQUIRED,
                'Please provide the path of the export.'
            );
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $sendEmail = false; // Not used for now
        $inputFilePath = $input->getArgument('input');
        $outputFilePath = $input->getArgument('output');
        $rows = $container->get(ConvertCsvToArray::class)->convert($inputFilePath);
        $userManager = $container->get('fos_user.user_manager');
        $tokenGenerator = $container->get('fos_user.util.token_generator');
        $router = $container->get('router');

        $createdCount = 0;
        $writer = Writer::createFromPath($outputFilePath, 'w+');
        $writer->insertOne(['email', 'confirmation_link']);
        $deduplicatedRows = [];

        $registrationForm = $container->get(RegistrationFormRepository::class)->findCurrent();
        $questions = $registrationForm->getRealQuestions();

        // We deduplicate rows by email
        foreach ($rows as $row) {
            $niddle = $row['email'];
            if (isset($deduplicatedRows[$niddle])) {
                continue;
            }
            $deduplicatedRows[$niddle] = $row;
        }
        foreach ($deduplicatedRows as $row) {
            try {
                /** @var User $user */
                $user = $userManager->createUser();
                $user->setUsername($row['username']);
                $user->setEmail(filter_var($row['email'], FILTER_SANITIZE_EMAIL));
                $user->setConfirmationToken($tokenGenerator->generateToken());
                $user->setResetPasswordToken($tokenGenerator->generateToken());
                $user->setEnabled(false);

                // Handle custom questions
                if ($questions->count() > 0) {
                    foreach($questions as $question) {
                        if (isset($row[$question->getTitle()])) {
                            $value = $row[$question->getTitle()];
                            $response = new ValueResponse();
                            $response->setValue($value);
                            $response->setQuestion($question);
                            $user->addResponse($response);
                        }
                    }
                }
                $userManager->updateUser($user);
                $confirmationUrl = $router->generate(
                    'account_confirm_email',
                    [
                        'token' => $user->getConfirmationToken(),
                    ],
                    true
                );
                if ($sendEmail) {
                    $this->getContainer()
                        ->get(UserNotifier::class)
                        ->emailConfirmation($user);
                }
                $writer->insertOne([$user->getEmail(), $confirmationUrl]);
                ++$createdCount;
            } catch (\Exception $e) {
                $output->write($e->getMessage());
                $output->write('Failed to create user : ' . $row['email']);
            }
        }
        $output->write($createdCount . ' users created.');
    }
}
