<?php

namespace Capco\AppBundle\Command;

use League\Csv\Writer;
use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateUserAccountsFromCSVCommand extends ContainerAwareCommand
{
    public function sendEmail($user, $confirmationUrl)
    {
        $container = $this->getContainer();
        $resolver = $container->get('capco.site_parameter.resolver');
        $to = $user->getEmail();
        $fromAddress = $resolver->getValue('admin.mail.notifications.send_address');
        $fromName = $resolver->getValue('admin.mail.notifications.send_name');
        $templating = $container->get('templating');
        $subject = 'Votre compte';

        $body = $templating->render('CapcoAppBundle:Mail:confirmUserAccountByCreatingPassword.html.twig', [
      'user' => $user,
      'confirmationUrl' => $confirmationUrl,
    ]);
        $container->get('capco.notify_manager')->sendEmail($to, $fromAddress, $fromName, $body, $subject);
    }

    protected function configure()
    {
        $this
            ->setName('capco:create-users-account-from-csv')
            ->addArgument(
                'input',
                InputArgument::REQUIRED,
                'Please provide the path of the file you want to use.'
            )
            ->addArgument(
                'output',
                InputArgument::REQUIRED,
                'Please provide the path of the export.'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $sendEmail = false; // Not used for now
        $inputFilePath = $input->getArgument('input');
        $outputFilePath = $input->getArgument('output');
        $rows = $container->get('import.csvtoarray')->convert($inputFilePath);
        $userManager = $container->get('fos_user.user_manager');
        $tokenGenerator = $container->get('fos_user.util.token_generator');
        $router = $container->get('router');

        $createdCount = 0;
        $writer = Writer::createFromPath($outputFilePath, 'w+');
        $writer->insertOne(['email', 'confirmation_link']);
        foreach ($rows as $row) {
            try {
                $user = $userManager->createUser();
                $user->setUsername($row['username']);
                $user->setEmail(filter_var($row['email'], FILTER_SANITIZE_EMAIL));
                $user->setConfirmationToken($tokenGenerator->generateToken());
                $user->setEnabled(false);
                $userManager->updateUser($user);
                $confirmationUrl = $router->generate('account_confirm_email', [
                  'token' => $user->getConfirmationToken(),
                ], true);
                if ($sendEmail) {
                    $this->sendEmail($user, $confirmationUrl);
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
