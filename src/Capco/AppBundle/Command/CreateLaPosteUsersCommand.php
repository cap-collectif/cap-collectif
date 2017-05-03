<?php

namespace Capco\AppBundle\Command;

use Symfony\Bundle\FrameworkBundle\Command\ContainerAwareCommand;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class CreateLaPosteUsersCommand extends ContainerAwareCommand
{
    protected function configure()
    {
        $this
            ->setName('capco:import:user-laposte')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $objPHPExcel = \PHPExcel_IOFactory::load('consultation/laposte.xlsx');
        $rows = $objPHPExcel->getActiveSheet()->toArray();
        $userManager = $this->getContainer()->get('fos_user.user_manager');
        $passwordEncoder = $this->getContainer()->get('security.password_encoder');

        for ($i = 1; $i <= 50; ++$i) {
            $user = $userManager->createUser();
            $username = 'EquipeCDM' . (string) $i;
            $user->setUsername($username);
            $user->setEmail(filter_var($username . '@laposte.net', FILTER_SANITIZE_EMAIL));
            $user->setPlainpassword('laposte');
            $user->setEnabled(true);
            $userManager->updateUser($user);
        }

        foreach ($rows as $row) {
            $user = $userManager->createUser();
            $user->setUsername($row[0] . ' ' . $row[1]);
            $user->setEmail(filter_var($row[3], FILTER_SANITIZE_EMAIL));
            $user->setPlainpassword('laposte');
            $user->setEnabled(true);
            $user->setBiography($row[2] . ', ' . $row[4]);
            $userManager->updateUser($user);
        }
    }
}
