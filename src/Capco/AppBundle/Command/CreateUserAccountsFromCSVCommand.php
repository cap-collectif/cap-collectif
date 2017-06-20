<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputArgument;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateUserAccountsFromCSVCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:create-users-account-from-csv')
            ->addArgument(
                'filePath',
                InputArgument::REQUIRED,
                'Please provide the path of the file you want to use.'
            )
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $container = $this->getContainer();
        $filePath = $input->getArgument('filePath');
        $rows = $container->get('import.csvtoarray')->convert($filePath);
        $resolver = $container->get('capco.site_parameter.resolver');
        $userManager = $container->get('fos_user.user_manager');
        $tokenGenerator = $container->get('fos_user.util.token_generator');
        $router = $container->get('router');
        $templating = $container->get('templating');

        $createdCount = 0;
        foreach ($rows as $row) {
            try {
                $user = $userManager->createUser();
                $user->setUsername($row['firstname'] . ' ' . $row['lastname']);
                $user->setEmail(filter_var($row['email'], FILTER_SANITIZE_EMAIL));
                $user->setConfirmationToken($tokenGenerator->generateToken());
                $user->setEnabled(false);
                $userManager->updateUser($user);
                $to = $user->getEmail();
                $fromAddress = $resolver->getValue('admin.mail.notifications.send_address');
                $fromName = $resolver->getValue('admin.mail.notifications.send_name');

                $subject = 'Votre compte';
                $confirmationUrl = $router->generate('account_confirm_email', [
                'token' => $user->getConfirmationToken(),
              ], true);

                $body = $templating->render('CapcoAppBundle:Mail:confirmUserAccountByCreatingPassword.html.twig', [
                'user' => $user,
                'confirmationUrl' => $confirmationUrl,
              ]);
                $container->get('capco.notify_manager')->sendEmail($to, $fromAddress, $fromName, $body, $subject);
                ++$createdCount;
            } catch (\Exception $e) {
                $output->write($e->getMessage());
                $output->write('Failed to create user : ' . $row['email']);
            }
        }
        $output->write($createdCount . ' users created.');
    }
}
